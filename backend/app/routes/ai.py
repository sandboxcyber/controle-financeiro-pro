from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.services.vera_service import (
    gerar_resumo_financeiro,
    responder_pergunta,
)

router = APIRouter(
    prefix="/ai",
    tags=["Vera IA"],
)


class PerguntaIA(BaseModel):
    mensagem: str


@router.get("/summary")
def resumo_vera(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return gerar_resumo_financeiro(
        db=db,
        user_id=current_user.id,
    )


@router.post("/chat")
def conversar_com_vera(
    dados: PerguntaIA,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resumo = gerar_resumo_financeiro(
        db=db,
        user_id=current_user.id,
    )

    resposta = responder_pergunta(
        pergunta=dados.mensagem,
        resumo=resumo,
    )

    return {
        "resposta": resposta,
        "resumo": resumo,
    }
