from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.investment import Investment
from app.models.user import User
from app.schemas.investment import (
    InvestmentCreate,
    InvestmentResponse,
    InvestmentUpdate,
)

router = APIRouter(
    prefix="/investments",
    tags=["Investments"],
)



def buscar_investimento(
    investment_id: int,
    user_id: int,
    db: Session,
) -> Investment:
    investimento = (
        db.query(Investment)
        .filter(
            Investment.id == investment_id,
            Investment.user_id == user_id,
        )
        .first()
    )

    if not investimento:
        raise HTTPException(
            status_code=404,
            detail="Investimento não encontrado.",
        )

    return investimento


@router.get("/", response_model=list[InvestmentResponse])
def listar_investimentos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Investment)
        .filter(Investment.user_id == current_user.id)
        .order_by(Investment.id.desc())
        .all()
    )


@router.post(
    "/",
    response_model=InvestmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_investimento(
    dados: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    investimento = Investment(
        **dados.model_dump(),
        user_id=current_user.id,
    )

    db.add(investimento)
    db.commit()
    db.refresh(investimento)

    return investimento


@router.put(
    "/{investment_id}",
    response_model=InvestmentResponse,
)
def editar_investimento(
    investment_id: int,
    dados: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    investimento = buscar_investimento(
        investment_id,
        current_user.id,
        db,
    )

    for campo, valor in dados.model_dump().items():
        setattr(investimento, campo, valor)

    db.commit()
    db.refresh(investimento)

    return investimento


@router.delete(
    "/{investment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_investimento(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    investimento = buscar_investimento(
        investment_id,
        current_user.id,
        db,
    )

    db.delete(investimento)
    db.commit()
