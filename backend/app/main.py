from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.resume import router as resume_router
from app.api.history import router as history_router

from app.api.rewrite import  router as rewrite_router
from app.api.test import router as test_router
from app.api.debug import router as debug_router
from app.api.coverletter import router as cover_letter_router
from app.api.export import router as export_router
from app.api.auth import router as auth_router
print("CAREEROPS BACKEND STARTING")
app = FastAPI()
print("FASTAPI CREATED")

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

# History routes
app.include_router(
    history_router,
    prefix="/api"
)

# Rewrite routes
app.include_router(
    rewrite_router,
    prefix="/api"
)

app.include_router(test_router)

app.include_router(debug_router)


app.include_router(
    cover_letter_router,
    prefix="/api"
)

app.include_router(
    export_router,
    prefix="/api"
)

app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"]
)

