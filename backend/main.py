from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from treatment_planner import TreatmentPlanRequest, TreatmentPlan, generate_treatment_plan

app = FastAPI()

origins = [
    "http://localhost:5173",  # React development server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello from Treatment Planner API"}

@app.post("/treatment-plan", response_model=TreatmentPlan)
async def create_treatment_plan(request: TreatmentPlanRequest):
    """Generate a treatment plan based on patient information"""
    try:
        return generate_treatment_plan(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))