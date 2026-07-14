from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.bank_account import BankAccount
from app.models.bank_transaction import BankTransaction
from app.models.user import User
from app.schemas.bank_account import (
    BankAccountCreate,
    BankAccountResponse,
    BankAccountUpdate,
    BankTransactionCreate,
    BankTransactionResponse,
    BankTransferCreate,
)

router = APIRouter(
    prefix="/banks",
    tags=["Banks"],
)


def buscar_conta(
    account_id: int,
    user_id: int,
    db: Session,
) -> BankAccount:
    conta = (
        db.query(BankAccount)
        .filter(
            BankAccount.id == account_id,
            BankAccount.user_id == user_id,
        )
        .first()
    )

    if not conta:
        raise HTTPException(
            status_code=404,
            detail="Conta bancária não encontrada.",
        )

    return conta


@router.get("/", response_model=list[BankAccountResponse])
def listar_contas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(BankAccount)
        .filter(BankAccount.user_id == current_user.id)
        .order_by(BankAccount.id.desc())
        .all()
    )


@router.post(
    "/",
    response_model=BankAccountResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_conta(
    dados: BankAccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conta = BankAccount(
        **dados.model_dump(),
        user_id=current_user.id,
    )

    db.add(conta)
    db.commit()
    db.refresh(conta)

    return conta


@router.put("/{account_id}", response_model=BankAccountResponse)
def editar_conta(
    account_id: int,
    dados: BankAccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conta = buscar_conta(account_id, current_user.id, db)

    for campo, valor in dados.model_dump().items():
        setattr(conta, campo, valor)

    db.commit()
    db.refresh(conta)

    return conta


@router.post(
    "/{account_id}/transactions",
    response_model=BankTransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_movimentacao(
    account_id: int,
    dados: BankTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conta = buscar_conta(account_id, current_user.id, db)

    tipo = dados.transaction_type.lower().strip()

    if tipo not in {"entrada", "saida"}:
        raise HTTPException(
            status_code=400,
            detail="O tipo deve ser entrada ou saída.",
        )

    if tipo == "saida" and dados.amount > float(conta.balance):
        raise HTTPException(
            status_code=400,
            detail=f"Saldo insuficiente. Disponível: R$ {conta.balance:.2f}",
        )

    movimentacao = BankTransaction(
        transaction_type=tipo,
        description=dados.description.strip(),
        amount=dados.amount,
        category=dados.category.strip() or "Outros",
        bank_account_id=conta.id,
        user_id=current_user.id,
    )

    if tipo == "entrada":
        conta.balance = float(conta.balance) + dados.amount
    else:
        conta.balance = float(conta.balance) - dados.amount

    db.add(movimentacao)
    db.commit()
    db.refresh(movimentacao)

    return movimentacao


@router.get(
    "/{account_id}/transactions",
    response_model=list[BankTransactionResponse],
)
def listar_movimentacoes(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    buscar_conta(account_id, current_user.id, db)

    return (
        db.query(BankTransaction)
        .filter(
            BankTransaction.bank_account_id == account_id,
            BankTransaction.user_id == current_user.id,
        )
        .order_by(BankTransaction.created_at.desc())
        .all()
    )




@router.post("/transfer")
def transferir_entre_contas(
    dados: BankTransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if dados.from_account_id == dados.to_account_id:
        raise HTTPException(
            status_code=400,
            detail="Escolha contas diferentes para a transferência.",
        )

    conta_origem = buscar_conta(
        dados.from_account_id,
        current_user.id,
        db,
    )

    conta_destino = buscar_conta(
        dados.to_account_id,
        current_user.id,
        db,
    )

    if dados.amount > float(conta_origem.balance):
        raise HTTPException(
            status_code=400,
            detail=(
                "Saldo insuficiente na conta de origem. "
                f"Disponível: R$ {conta_origem.balance:.2f}"
            ),
        )

    conta_origem.balance = (
        float(conta_origem.balance) - dados.amount
    )

    conta_destino.balance = (
        float(conta_destino.balance) + dados.amount
    )

    saida = BankTransaction(
        transaction_type="saida",
        description=(
            f"{dados.description} para {conta_destino.bank_name}"
        ),
        amount=dados.amount,
        category="Transferência",
        bank_account_id=conta_origem.id,
        user_id=current_user.id,
    )

    entrada = BankTransaction(
        transaction_type="entrada",
        description=(
            f"{dados.description} de {conta_origem.bank_name}"
        ),
        amount=dados.amount,
        category="Transferência",
        bank_account_id=conta_destino.id,
        user_id=current_user.id,
    )

    db.add(saida)
    db.add(entrada)
    db.commit()

    return {
        "message": "Transferência realizada com sucesso.",
        "amount": dados.amount,
        "from_account_id": conta_origem.id,
        "to_account_id": conta_destino.id,
        "from_balance": conta_origem.balance,
        "to_balance": conta_destino.balance,
    }


@router.delete(
    "/{account_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_conta(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conta = buscar_conta(account_id, current_user.id, db)

    db.query(BankTransaction).filter(
        BankTransaction.bank_account_id == account_id,
        BankTransaction.user_id == current_user.id,
    ).delete()

    db.delete(conta)
    db.commit()
