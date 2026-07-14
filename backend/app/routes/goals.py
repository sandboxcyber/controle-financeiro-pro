from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.goal import Goal
from app.models.goal_contribution import GoalContribution
from app.models.user import User
from app.schemas.goal import (
    GoalContributionCreate,
    GoalContributionResponse,
    GoalCreate,
    GoalResponse,
    GoalUpdate,
)

router = APIRouter(
    prefix="/goals",
    tags=["Goals"],
)


def buscar_meta(
    goal_id: int,
    user_id: int,
    db: Session,
) -> Goal:
    meta = (
        db.query(Goal)
        .filter(
            Goal.id == goal_id,
            Goal.user_id == user_id,
        )
        .first()
    )

    if not meta:
        raise HTTPException(
            status_code=404,
            detail="Meta não encontrada.",
        )

    return meta


@router.get("/", response_model=list[GoalResponse])
def listar_metas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .order_by(Goal.id.desc())
        .all()
    )


@router.post(
    "/",
    response_model=GoalResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_meta(
    dados: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if dados.current_amount > dados.target_amount:
        raise HTTPException(
            status_code=400,
            detail="O valor atual não pode superar o objetivo.",
        )

    meta = Goal(
        **dados.model_dump(),
        user_id=current_user.id,
    )

    db.add(meta)
    db.commit()
    db.refresh(meta)

    return meta


@router.put("/{goal_id}", response_model=GoalResponse)
def editar_meta(
    goal_id: int,
    dados: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meta = buscar_meta(goal_id, current_user.id, db)

    if dados.current_amount > dados.target_amount:
        raise HTTPException(
            status_code=400,
            detail="O valor atual não pode superar o objetivo.",
        )

    for campo, valor in dados.model_dump().items():
        setattr(meta, campo, valor)

    db.commit()
    db.refresh(meta)

    return meta


@router.post(
    "/{goal_id}/contributions",
    response_model=GoalContributionResponse,
    status_code=status.HTTP_201_CREATED,
)
def adicionar_valor(
    goal_id: int,
    dados: GoalContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meta = buscar_meta(goal_id, current_user.id, db)

    novo_total = float(meta.current_amount) + dados.amount

    if novo_total > float(meta.target_amount):
        falta = float(meta.target_amount) - float(meta.current_amount)

        raise HTTPException(
            status_code=400,
            detail=f"Valor acima da meta. Falta apenas R$ {falta:.2f}.",
        )

    deposito = GoalContribution(
        amount=dados.amount,
        description=dados.description.strip() or "Depósito na meta",
        goal_id=meta.id,
        user_id=current_user.id,
    )

    meta.current_amount = novo_total

    db.add(deposito)
    db.commit()
    db.refresh(deposito)

    return deposito


@router.get(
    "/{goal_id}/contributions",
    response_model=list[GoalContributionResponse],
)
def listar_depositos(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    buscar_meta(goal_id, current_user.id, db)

    return (
        db.query(GoalContribution)
        .filter(
            GoalContribution.goal_id == goal_id,
            GoalContribution.user_id == current_user.id,
        )
        .order_by(GoalContribution.created_at.desc())
        .all()
    )


@router.delete(
    "/{goal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_meta(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meta = buscar_meta(goal_id, current_user.id, db)

    db.query(GoalContribution).filter(
        GoalContribution.goal_id == goal_id,
        GoalContribution.user_id == current_user.id,
    ).delete()

    db.delete(meta)
    db.commit()
