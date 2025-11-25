from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import config, events, exporters, health

app = FastAPI(title="ANPR Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(config.router)
app.include_router(events.router)
app.include_router(exporters.router)


@app.on_event("startup")
async def startup_event() -> None:
    init_db()
