from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone
import json
import googlemaps

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Pinecone client
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Initialize Google Maps client
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

# Connect to the index
index_name = "health-assistant"
index = pc.Index(index_name)

# Models
class Symptom(BaseModel):
    id: int
    text: str

class Allergy(BaseModel):
    id: int
    text: str

class PhysicalCondition(BaseModel):
    age: str
    mobilityIssues: str
    allergies: List[Allergy]

class TreatmentPlanRequest(BaseModel):
    symptoms: List[Symptom]
    physicalCondition: PhysicalCondition
    location: str

class TreatmentPlan(BaseModel):
    medicalActions: List[str]
    locationConsiderations: List[str]
    justifications: List[str]

# Create FastAPI app
app = FastAPI()

# Configure CORS
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
    return {"message": "Treatment Planner API"}

def generate_embedding(text: str):
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding

def get_nearby_healthcare(location: str, radius_miles=10):
    try:
        geocode = gmaps.geocode(location)
        if not geocode:
            return ["Invalid location"]
        lat_lng = geocode[0]['geometry']['location']
        
        places = gmaps.places_nearby(
            location=f"{lat_lng['lat']},{lat_lng['lng']}",
            keyword="hospital clinic doctor", 
            rank_by='distance'
        ).get('results', [])[:5]  # Get top 5 nearest
        
        if not places:
            return ["No nearby facilities found - recommend Telehealth"]
            
        return [f"{p['name']} ({p.get('rating', '?')}★)" for p in places]
        
    except Exception as e:
        return [f"Location error: {str(e)} - verify address"]

def retrieve_relevant_information(query_text, top_k=5):
    query_embedding = generate_embedding(query_text)
    
    # Search Pinecone index
    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True,
        namespace="diseases"  # Use the same namespace as in upload.py
    )
    
    # Extract relevant text from the results
    context_texts = []
    for match in results.matches:
        if match.score > 0.8:  # Only include relevant matches
            context_texts.append(match.metadata["text"])
    
    return "\n\n".join(context_texts)

def generate_treatment_plan(request_data):
    # Create a search query from patient information
    symptoms_text = ", ".join([s.text for s in request_data.symptoms])
    allergies_text = ", ".join([a.text for a in request_data.physicalCondition.allergies])
    nearby_healthcare = get_nearby_healthcare(request_data.location)
    healthcare_text = "Nearby healthcare options:\n- " + "\n- ".join(nearby_healthcare)

    query_text = f"""
    Patient with symptoms: {symptoms_text}. 
    Age: {request_data.physicalCondition.age}. 
    Mobility issues: {request_data.physicalCondition.mobilityIssues}. 
    Allergies: {allergies_text}. 
    Location: {request_data.location}.
    """
    
    # Retrieve relevant medical information
    context = retrieve_relevant_information(query_text)
    
    # Create LLM prompt with retrieved information
    prompt = f"""
    You are a medical treatment planning assistant. Based on the patient information and medical knowledge provided,
    create a detailed treatment plan. Consider the patient's specific circumstances and needs.
    
    PATIENT INFORMATION:
    - Symptoms: {symptoms_text}
    - Age: {request_data.physicalCondition.age}
    - Mobility Issues: {request_data.physicalCondition.mobilityIssues}
    - Allergies: {allergies_text}
    - Geographic Location: {request_data.location}
    - Nearby Healthcare Options: {healthcare_text}
    
    RELEVANT MEDICAL INFORMATION:
    {context}
    
    Please provide:
    1. A list of recommended medical actions (e.g., tests, consultations, treatments)
    2. Location-specific considerations including these facilities or Telehealth options
    3. Justifications for each recommendation based on symptoms and patient condition
    
    Format your response as a JSON object with the following structure:
    {{
        "medicalActions": ["action1", "action2", ...],
        "locationConsiderations": ["consideration1", "consideration2", ...],
        "justifications": ["justification1", "justification2", ...]
    }}
    """
    
    # Get response from OpenAI
    response = client.chat.completions.create(
        model="gpt-4o",  # or another appropriate model
        messages=[
            {"role": "system", "content": "You are a medical treatment planning assistant."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    # Extract and parse the JSON response
    try:
        treatment_plan = json.loads(response.choices[0].message.content)
        return TreatmentPlan(**treatment_plan)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing response: {str(e)}")

@app.post("/treatment-plan", response_model=TreatmentPlan)
async def create_treatment_plan(request: TreatmentPlanRequest):
    
    try:
        return generate_treatment_plan(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))