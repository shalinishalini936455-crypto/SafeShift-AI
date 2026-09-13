import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.database import engine, Base
from models.habitation import Habitation
from models.redzone import RedZone
from models.safesite import SafeSite
from models.relocation import RelocationPlan

from routes.habitations import router as habitation_router
from routes.redzones import router as redzone_router
from routes.safesites import router as safesite_router
from routes.relocation import router as relocation_router
from routes.risk import router as risk_router
from routes.risk_calculation import router as risk_calculation_router
from routes.change_detection import router as change_detection_router
from routes.ai_detections import router as ai_detections_router
from routes.capacity import router as capacity_router
from routes.relocation_matching import router as relocation_matching_router
from routes.relocation_priority import router as relocation_priority_router
from routes.notifications import router as notifications_router
from routes.dashboard import router as dashboard_router
from routes.reports import router as reports_router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="SafeShift AI",
    description="Intelligent Disaster Risk & Relocation Decision Support System",
    version="1.0.0"
)


# Allow React frontend to connect to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "SafeShift AI Backend is running",
        "status": "success"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SafeShift AI Backend"
    }

@app.get("/api/weather")
def get_weather():
    latitude = 11.634446
    longitude = 78.09652

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m",
        "timezone": "Asia/Kolkata"
    }

    response = requests.get(url, params=params, timeout=10)

    return response.json()

app.include_router(habitation_router)
app.include_router(redzone_router)
app.include_router(safesite_router)
app.include_router(relocation_router)
app.include_router(risk_router)
app.include_router(change_detection_router)
app.include_router(ai_detections_router)
app.include_router(risk_calculation_router)
app.include_router(capacity_router)
app.include_router(relocation_matching_router)
app.include_router(relocation_priority_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)
app.include_router(reports_router)