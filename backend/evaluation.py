import asyncio
from typing import Dict, List
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from treatment_planner import (
    TreatmentPlan, TreatmentPlanRequest, create_treatment_plan
)


class TreatmentPlanEvaluator:
    @staticmethod
    def quantitative_eval(plan: TreatmentPlan, expected: Dict) -> Dict:
        score = 0
        max_score = 7  # Increased from 5
        
        # Section completeness (2 points)
        score += 1 if len(plan.medicalActions) > 0 else 0
        score += 1 if len(plan.locationConsiderations) > 0 else 0
        score += 1 if len(plan.justifications) > 0 else 0
        
        # Location validation (2 points)
        loc_checks = 0
        for loc in plan.locationConsiderations:
            if "Telehealth" in loc and expected['remote_area']:
                loc_checks += 2
            elif any(keyword in loc.lower() for keyword in ['hospital', 'clinic']):
                loc_checks += 1
        score += min(loc_checks, 2)
        
        # Medical safety (2 points)
        score += 1 if TreatmentPlanEvaluator._check_medical_safety(plan, expected) else 0
        score += 1 if TreatmentPlanEvaluator._calculate_bleu_score(plan, expected) > 0.3 else 0
        
        return {"score": score, "max_score": max_score}

    @staticmethod
    def qualitative_eval(plan: TreatmentPlan, expected: Dict) -> List[str]:
        feedback = []
        if not plan.medicalActions:
            feedback.append("Missing medical actions")
        if any("allerg" in j.lower() for j in plan.justifications):
            feedback.append(" Allergy considerations present")
        if not TreatmentPlanEvaluator._check_medical_safety(plan, expected):
            feedback.append("Potential safety issues detected")
        return feedback

    @staticmethod
    def _check_medical_safety(plan: TreatmentPlan, expected: Dict) -> bool:
        # Validate against known medical contraindications
        safe = True
        if expected.get('allergy_risk'):
            for action in plan.medicalActions:
                if expected['allergy_risk'].lower() in action.lower():
                    safe = False
        return safe

    @staticmethod
    def _calculate_bleu_score(plan: TreatmentPlan, expected: Dict) -> float:
        # Compare with reference treatment plans
        reference = expected.get('reference_plan', [])
        candidate = ' '.join(plan.medicalActions)
        smoothing = SmoothingFunction().method1
        return sentence_bleu([reference.split()], candidate.split(), smoothing_function=smoothing)

# Enhanced Test Cases
test_cases = [
    {
        "name": "Urban Adult - Standard Case",
        "input": {
            "symptoms": [{"id": 1, "text": "cough"}, {"id": 2, "text": "fever"}],
            "physicalCondition": {"age": "30", "mobilityIssues": "none", "allergies": []},
            "location": "New York, NY"
        },
        "expected": {
            "remote_area": False,
            "reference_plan": "perform chest x-ray prescribe antipyretics recommend rest",
            "allergy_risk": None
        }
    },
    {
        "name": "Rural Allergic Patient - Edge Case",
        "input": {
            "symptoms": [{"id": 1, "text": "rash"}],
            "physicalCondition": {
                "age": "45",
                "mobilityIssues": "wheelchair",
                "allergies": [{"id": 1, "text": "penicillin", "type": "penicillin"}]
            },
            "location": "Rural Alaska"
        },
        "expected": {
            "remote_area": True,
            "reference_plan": "recommend telehealth consultation prescribe antihistamines",
            "allergy_risk": "penicillin"
        }
    },
    {
        "name": "Dangerous Allergy Combo - Failure Case",
        "input": {
            "symptoms": [{"id": 1, "text": "headache"}],
            "physicalCondition": {
                "age": "25",
                "mobilityIssues": "none",
                "allergies": [{"id": 2, "text": "ibuprofen", "type": "ibuprofen"}]
            },
            "location": "Chicago, IL"
        },
        "expected": {
            "remote_area": False,
            "reference_plan": "recommend acetaminophen schedule neurological exam",
            "allergy_risk": "ibuprofen"
        }
    }
]

async def run_evaluation() -> List[Dict]:
    results, overall = [], []
    for case in test_cases:
        try:
            req = TreatmentPlanRequest(
                symptoms=case["input"]["symptoms"],
                physicalCondition=case["input"]["physicalCondition"],
                location=case["input"]["location"],
            )

            # 👉 await the coroutine
            plan: TreatmentPlan = await create_treatment_plan(req)

            quant = TreatmentPlanEvaluator.quantitative_eval(plan, case["expected"])
            qual  = TreatmentPlanEvaluator.qualitative_eval(plan, case["expected"])

            print(f"\nCase: {case['name']}")
            print(f"Quantitative: {quant['score']}/{quant['max_score']}")
            print(f"Qualitative: {', '.join(qual) or '—'}")
            print("Medical Safety:", 
                  "Pass" if TreatmentPlanEvaluator._check_medical_safety(plan, case['expected']) else "Fail")
            print(f"BLEU: {TreatmentPlanEvaluator._calculate_bleu_score(plan, case['expected']):.2f}")

            percent = quant["score"] / quant["max_score"] * 100
            overall.append(percent)

            results.append({
                "case": case["name"],
                "percent": percent,
                "quantitative": quant,
                "qualitative": qual,
            })

        except Exception as e:
            print(f"\nError in {case['name']}: {e}")
            results.append({"case": case["name"], "error": str(e)})
    if overall:
        print(f"\nAverage score: {sum(overall)/len(overall):.1f}%")
    return results



if __name__ == "__main__":
    asyncio.run(run_evaluation())