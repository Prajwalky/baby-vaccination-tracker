from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# India Vaccination Schedule (IAP 2023)
INDIA_VACCINATION_SCHEDULE = [
    {"name": "BCG", "age_weeks": 0, "description": "BCG (Tuberculosis)"},
    {"name": "OPV-0", "age_weeks": 0, "description": "Oral Polio Vaccine - Birth Dose"},
    {"name": "Hepatitis B-1", "age_weeks": 0, "description": "Hepatitis B - First Dose"},
    
    {"name": "DTP-1", "age_weeks": 6, "description": "Diphtheria, Tetanus, Pertussis - First Dose"},
    {"name": "IPV-1", "age_weeks": 6, "description": "Inactivated Polio Vaccine - First Dose"},
    {"name": "Hib-1", "age_weeks": 6, "description": "Haemophilus Influenzae Type B - First Dose"},
    {"name": "Hepatitis B-2", "age_weeks": 6, "description": "Hepatitis B - Second Dose"},
    {"name": "Rotavirus-1", "age_weeks": 6, "description": "Rotavirus Vaccine - First Dose"},
    {"name": "PCV-1", "age_weeks": 6, "description": "Pneumococcal Conjugate Vaccine - First Dose"},
    
    {"name": "DTP-2", "age_weeks": 10, "description": "Diphtheria, Tetanus, Pertussis - Second Dose"},
    {"name": "IPV-2", "age_weeks": 10, "description": "Inactivated Polio Vaccine - Second Dose"},
    {"name": "Hib-2", "age_weeks": 10, "description": "Haemophilus Influenzae Type B - Second Dose"},
    {"name": "Rotavirus-2", "age_weeks": 10, "description": "Rotavirus Vaccine - Second Dose"},
    {"name": "PCV-2", "age_weeks": 10, "description": "Pneumococcal Conjugate Vaccine - Second Dose"},
    
    {"name": "DTP-3", "age_weeks": 14, "description": "Diphtheria, Tetanus, Pertussis - Third Dose"},
    {"name": "IPV-3", "age_weeks": 14, "description": "Inactivated Polio Vaccine - Third Dose"},
    {"name": "Hib-3", "age_weeks": 14, "description": "Haemophilus Influenzae Type B - Third Dose"},
    {"name": "Rotavirus-3", "age_weeks": 14, "description": "Rotavirus Vaccine - Third Dose"},
    {"name": "PCV-3", "age_weeks": 14, "description": "Pneumococcal Conjugate Vaccine - Third Dose"},
    
    {"name": "OPV-1", "age_weeks": 26, "description": "Oral Polio Vaccine - First Dose (6 months)"},
    {"name": "Hepatitis B-3", "age_weeks": 26, "description": "Hepatitis B - Third Dose"},
    
    {"name": "MMR-1", "age_weeks": 39, "description": "Measles, Mumps, Rubella - First Dose (9 months)"},
    
    {"name": "Hepatitis A-1", "age_weeks": 52, "description": "Hepatitis A - First Dose (12 months)"},
    
    {"name": "MMR-2", "age_weeks": 65, "description": "Measles, Mumps, Rubella - Second Dose (15 months)"},
    {"name": "Varicella-1", "age_weeks": 65, "description": "Chickenpox Vaccine - First Dose (15 months)"},
    {"name": "PCV Booster", "age_weeks": 65, "description": "Pneumococcal Conjugate Vaccine - Booster (15 months)"},
    
    {"name": "DTP Booster-1", "age_weeks": 72, "description": "Diphtheria, Tetanus, Pertussis - First Booster (16-18 months)"},
    {"name": "IPV Booster", "age_weeks": 72, "description": "Inactivated Polio Vaccine - Booster (16-18 months)"},
    {"name": "Hib Booster", "age_weeks": 72, "description": "Haemophilus Influenzae Type B - Booster (16-18 months)"},
    
    {"name": "Hepatitis A-2", "age_weeks": 78, "description": "Hepatitis A - Second Dose (18 months)"},
    
    {"name": "Typhoid", "age_weeks": 104, "description": "Typhoid Vaccine (2 years)"},
]

# Define Models
class BabyCreate(BaseModel):
    name: str
    dob: str  # ISO format date string
    photo: Optional[str] = None  # base64 encoded image
    gender: Optional[str] = None
    blood_group: Optional[str] = None

class Baby(BaseModel):
    id: str
    name: str
    dob: str
    photo: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    created_at: datetime

class VaccinationCreate(BaseModel):
    baby_id: str
    name: str
    description: str
    due_date: str
    age_weeks: int
    completed: bool = False
    completed_date: Optional[str] = None
    notes: Optional[str] = None

class VaccinationUpdate(BaseModel):
    completed: bool
    completed_date: Optional[str] = None
    notes: Optional[str] = None

class Vaccination(BaseModel):
    id: str
    baby_id: str
    name: str
    description: str
    due_date: str
    age_weeks: int
    completed: bool
    completed_date: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

# Helper function to generate vaccination schedule
def generate_vaccination_schedule(dob_str: str, baby_id: str):
    dob = datetime.fromisoformat(dob_str.replace('Z', '+00:00'))
    vaccinations = []
    
    for vac in INDIA_VACCINATION_SCHEDULE:
        due_date = dob + timedelta(weeks=vac["age_weeks"])
        vaccinations.append({
            "baby_id": baby_id,
            "name": vac["name"],
            "description": vac["description"],
            "due_date": due_date.isoformat(),
            "age_weeks": vac["age_weeks"],
            "completed": False,
            "completed_date": None,
            "notes": None,
            "created_at": datetime.utcnow()
        })
    
    return vaccinations

# Routes
@api_router.get("/")
async def root():
    return {"message": "Baby Vaccination Tracker API"}

# Baby endpoints
@api_router.post("/baby", response_model=Baby)
async def create_baby(baby: BabyCreate):
    # Check if baby already exists
    existing_baby = await db.babies.find_one()
    if existing_baby:
        raise HTTPException(status_code=400, detail="Baby profile already exists. Only one baby is supported.")
    
    baby_dict = baby.dict()
    baby_dict["created_at"] = datetime.utcnow()
    
    result = await db.babies.insert_one(baby_dict)
    baby_id = str(result.inserted_id)
    
    # Generate vaccination schedule
    vaccinations = generate_vaccination_schedule(baby.dob, baby_id)
    if vaccinations:
        await db.vaccinations.insert_many(vaccinations)
    
    baby_dict["id"] = baby_id
    return Baby(**baby_dict)

@api_router.get("/baby", response_model=Optional[Baby])
async def get_baby():
    baby = await db.babies.find_one()
    if not baby:
        return None
    
    baby["id"] = str(baby["_id"])
    return Baby(**baby)

@api_router.put("/baby/{baby_id}", response_model=Baby)
async def update_baby(baby_id: str, baby: BabyCreate):
    baby_dict = baby.dict()
    
    result = await db.babies.update_one(
        {"_id": ObjectId(baby_id)},
        {"$set": baby_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Baby not found")
    
    updated_baby = await db.babies.find_one({"_id": ObjectId(baby_id)})
    updated_baby["id"] = str(updated_baby["_id"])
    return Baby(**updated_baby)

# Vaccination endpoints
@api_router.get("/vaccinations/{baby_id}", response_model=List[Vaccination])
async def get_vaccinations(baby_id: str):
    vaccinations = await db.vaccinations.find({"baby_id": baby_id}).sort("due_date", 1).to_list(1000)
    
    result = []
    for vac in vaccinations:
        vac["id"] = str(vac["_id"])
        result.append(Vaccination(**vac))
    
    return result

@api_router.patch("/vaccinations/{vaccination_id}", response_model=Vaccination)
async def update_vaccination(vaccination_id: str, update: VaccinationUpdate):
    update_dict = update.dict(exclude_unset=True)
    
    result = await db.vaccinations.update_one(
        {"_id": ObjectId(vaccination_id)},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vaccination not found")
    
    updated_vac = await db.vaccinations.find_one({"_id": ObjectId(vaccination_id)})
    updated_vac["id"] = str(updated_vac["_id"])
    return Vaccination(**updated_vac)

@api_router.get("/vaccinations/{baby_id}/upcoming")
async def get_upcoming_vaccinations(baby_id: str):
    """Get upcoming vaccinations (not completed)"""
    vaccinations = await db.vaccinations.find({
        "baby_id": baby_id,
        "completed": False
    }).sort("due_date", 1).to_list(1000)
    
    result = []
    for vac in vaccinations:
        vac["id"] = str(vac["_id"])
        result.append(Vaccination(**vac))
    
    return result

@api_router.get("/vaccinations/{baby_id}/completed")
async def get_completed_vaccinations(baby_id: str):
    """Get completed vaccinations"""
    vaccinations = await db.vaccinations.find({
        "baby_id": baby_id,
        "completed": True
    }).sort("completed_date", -1).to_list(1000)
    
    result = []
    for vac in vaccinations:
        vac["id"] = str(vac["_id"])
        result.append(Vaccination(**vac))
    
    return result

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
