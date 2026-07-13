from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.card import Card
from app.models.card_transaction import CardTransaction
from app.models.user import User
from app.models.expense import Expense
from app.schemas.card import (
    CardCreate,
    CardExpenseCreate,
    CardExpenseResponse,
    CardResponse,
    CardUpdate,
)

router = APIRouter(
    prefix="/cards",
    tags=["Cards"],
)


def buscar_cartao(
    card_id: int,
    user_id: int,
    db: Session,
) -> Card:
    cartao = (
        db.query(Card)
        .filter(
            Card.id == card_id,
            Card.user_id == user_id,
        )
        .first()
    )

    if not cartao:
        raise HTTPException(
            status_code=404,
            detail="Cartão não encontrado.",
        )

    return cartao


@router.get("/", response_model=list[CardResponse])
def listar_cartoes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Card)
        .filter(Card.user_id == current_user.id)
        .order_by(Card.id.desc())
        .all()
    )


@router.post(
    "/",
    response_model=CardResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_cartao(
    dados: CardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if dados.used > dados.limit:
        raise HTTPException(
            status_code=400,
            detail="O valor utilizado não pode superar o limite.",
        )

    novo = Card(
        **dados.model_dump(),
        user_id=current_user.id,
    )

    db.add(novo)
    db.commit()
    db.refresh(novo)

    return novo


@router.put("/{card_id}", response_model=CardResponse)
def editar_cartao(
    card_id: int,
    dados: CardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cartao = buscar_cartao(
        card_id,
        current_user.id,
        db,
    )

    if dados.used > dados.limit:
        raise HTTPException(
            status_code=400,
            detail="O valor utilizado não pode superar o limite.",
        )

    for campo, valor in dados.model_dump().items():
        setattr(cartao, campo, valor)

    db.commit()
    db.refresh(cartao)

    return cartao


@router.post(
    "/{card_id}/expenses",
    response_model=CardExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
def lancar_gasto(
    card_id: int,
    dados: CardExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cartao = buscar_cartao(
        card_id,
        current_user.id,
        db,
    )

    novo_utilizado = float(cartao.used or 0) + dados.amount

    if novo_utilizado > float(cartao.limit):
        disponivel = float(cartao.limit) - float(cartao.used or 0)

        raise HTTPException(
            status_code=400,
            detail=(
                "Limite insuficiente. "
                f"Disponível: R$ {disponivel:.2f}"
            ),
        )

    gasto = CardTransaction(
        description=dados.description.strip(),
        amount=dados.amount,
        category=dados.category.strip() or "Outros",
        card_id=cartao.id,
        user_id=current_user.id,
    )

    despesa = Expense(
        description=f"[{cartao.name}] {dados.description}",
        amount=dados.amount,
        category=dados.category.strip() or "Cartão",
        user_id=current_user.id,
    )

    cartao.used = novo_utilizado

    db.add(despesa)

    db.add(gasto)
    db.commit()
    db.refresh(gasto)

    return gasto


@router.get(
    "/{card_id}/expenses",
    response_model=list[CardExpenseResponse],
)
def listar_gastos(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    buscar_cartao(
        card_id,
        current_user.id,
        db,
    )

    return (
        db.query(CardTransaction)
        .filter(
            CardTransaction.card_id == card_id,
            CardTransaction.user_id == current_user.id,
        )
        .order_by(CardTransaction.purchased_at.desc())
        .all()
    )


@router.delete(
    "/{card_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_cartao(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cartao = buscar_cartao(
        card_id,
        current_user.id,
        db,
    )

    db.query(CardTransaction).filter(
        CardTransaction.card_id == card_id,
        CardTransaction.user_id == current_user.id,
    ).delete()

    db.delete(cartao)
    db.commit()
