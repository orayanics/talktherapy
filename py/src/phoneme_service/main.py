from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from phoneme_service.api.routes import initialize_models
from phoneme_service.api.routes import router as api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await asyncio.to_thread(initialize_models)
    yield


app = FastAPI(title="TalkTherapy Phoneme Analysis", version="0.1.0", lifespan=lifespan)

app.include_router(api_router)
