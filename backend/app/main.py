from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.schemas import HealthResponse
from app.routers import nutrition, freshness, hygiene, recipes, meal_planner

settings = get_settings()

app = FastAPI(
    title="Food Verse AI – Multimodal Food Intelligence Agent",
    description=(
        "Production-grade, lightweight AI backend for food recognition, nutrition estimation, "
        "freshness observation, restaurant hygiene observation, smart cooking, and meal planning."
    ),
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Module Routers
app.include_router(nutrition.router)
app.include_router(freshness.router)
app.include_router(hygiene.router)
app.include_router(recipes.router)
app.include_router(meal_planner.router)

@app.get("/", tags=["General"])
async def root():
    return {
        "service": "Food Verse AI API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "description": "Multimodal Food Intelligence Agent backend powered by FastAPI & Google Gemini Vision."
    }

@app.get("/api/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """
    Returns API health status and whether the Groq AI credentials are configured.
    """
    is_configured = settings.is_api_key_set
    message = (
        "Groq Cloud AI is ready for live inference."
        if is_configured
        else "API key is not configured. Please set GROQ_API_KEY in backend/.env."
    )
    return HealthResponse(
        status="ok",
        service="Food Verse AI Backend (Groq)",
        version="1.0.0",
        api_key_configured=is_configured,
        model=settings.groq_vision_model,
        message=message
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
