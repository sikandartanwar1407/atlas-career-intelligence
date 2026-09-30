from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers.health import router as health_router
from app.routers.profiles import router as profiles_router
from app.routers.assessment import router as assessment_router
from app.routers.diagnosis import router as diagnosis_router
from app.routers.roadmap import router as roadmap_router

settings = get_settings()

app = FastAPI(
    title="ATLAS API",
    description="Backend API service for ATLAS Career Architecture Platform",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers (prefixed with /api)
app.include_router(health_router, prefix="/api")
app.include_router(profiles_router, prefix="/api")
app.include_router(assessment_router, prefix="/api")
app.include_router(diagnosis_router, prefix="/api")
app.include_router(roadmap_router, prefix="/api")


@app.get("/", summary="Root Endpoint")
def root():
    return {
        "message": "ATLAS API is running",
    }
