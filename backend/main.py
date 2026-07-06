from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.db import create_tables_if_not_exist
from app.routers import diary, transactions


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables_if_not_exist()
    yield


app = FastAPI(title="TooHarness", lifespan=lifespan)
app.include_router(diary.router)
app.include_router(transactions.router)


@app.get("/health")
def health():
    return {"status": "ok"}
