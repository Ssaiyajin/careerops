import asyncio
import logging
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.resume import router as resume_router
from app.api.history import router as history_router

from app.api.rewrite import router as rewrite_router
from app.api.coverletter import router as cover_letter_router
from app.api.export import router as export_router
from app.api.auth import router as auth_router
from app.database.database_service import purge_expired_resume_analyses

print("CAREEROPS BACKEND STARTING")


async def _resume_retention_sweeper():
    while True:
        try:
            deleted_count = await asyncio.to_thread(purge_expired_resume_analyses)
            if deleted_count:
                logging.info("Purged %s expired resume analyses", deleted_count)
            retry_after = 24 * 60 * 60
        except Exception:
            logging.exception("Resume retention sweep failed")
            retry_after = 15 * 60
        await asyncio.sleep(retry_after)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(_resume_retention_sweeper())
    try:
        yield
    finally:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task


app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
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


@app.get("/favicon.ico")
def favicon():
    """Return 204 No Content for favicon requests to prevent 404 errors"""
    from fastapi import Response
    return Response(status_code=204)


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
