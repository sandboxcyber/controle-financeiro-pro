from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import Token
from app.core.security import verificar_senha, criar_token_acesso

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    usuario = db.query(User).filter(User.email == form_data.username).first()

    if not usuario:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    if not verificar_senha(form_data.password, usuario.password_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    token = criar_token_acesso({
        "sub": str(usuario.id),
        "email": usuario.email
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
