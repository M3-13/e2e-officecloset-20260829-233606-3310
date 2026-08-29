"""FastAPI application entry point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend import models
from backend.auth import router as auth_router
from backend.config import FRONTEND_ORIGIN
from backend.db import engine
from backend.outfits import router as outfits_router
from backend.wardrobe import router as wardrobe_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    models.Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Glamouröser Kleiderschrank-Manager", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(wardrobe_router)
app.include_router(outfits_router)
