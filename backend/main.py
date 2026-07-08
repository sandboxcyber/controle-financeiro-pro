from fastapi import FastAPI

from app.database.database import Base, engine
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinMaster PRO API",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "app": "FinMaster PRO",
        "status": "online",
        "message": "API funcionando"
    }


@app.get("/health")
def health():
    return {"status": "ok"}
