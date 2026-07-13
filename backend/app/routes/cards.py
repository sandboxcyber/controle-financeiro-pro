from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.card import Card
from app.schemas.card import CardCreate

router=APIRouter(prefix="/cards",tags=["Cards"])

@router.get("/")
def listar(db:Session=Depends(get_db)):
    return db.query(Card).all()

@router.post("/")
def criar(card:CardCreate,db:Session=Depends(get_db)):
    novo=Card(**card.model_dump())
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo
