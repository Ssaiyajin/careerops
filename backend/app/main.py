from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.resume import router as resume_router

app = FastAPI()


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "CareerOps AI Backend Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# Resume routes
app.include_router(
    resume_router,
    prefix="/api/resume",
    tags=["Resume"]
)