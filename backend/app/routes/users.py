from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserOut
from app.core.security import gerar_hash_senha

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserOut)
def criar_usuario(dados: UserCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(User).filter(User.email == dados.email).first()

    if usuario_existente:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    novo_usuario = User(
        name=dados.name,
        email=dados.email,
        password_hash=gerar_hash_senha(dados.password)
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    return novo_usuario
