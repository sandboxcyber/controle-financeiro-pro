from calendar import monthrange
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.bill import Bill
from app.models.expense import Expense
from app.models.user import User
from app.schemas.bill import (
    BillCreate,
    BillInstallmentCreate,
    BillResponse,
    BillUpdate,
)

router = APIRouter(
    prefix="/bills",
    tags=["Bills"],
)


def buscar_conta(
    bill_id: int,
    user_id: int,
    db: Session,
) -> Bill:
    conta = (
        db.query(Bill)
        .filter(
            Bill.id == bill_id,
            Bill.user_id == user_id,
        )
        .first()
    )

    if not conta:
        raise HTTPException(
            status_code=404,
            detail="Conta não encontrada.",
        )

    return conta


def adicionar_meses(data: datetime, meses: int) -> datetime:
    novo_mes = data.month - 1 + meses
    ano = data.year + novo_mes // 12
    mes = novo_mes % 12 + 1
    dia = min(data.day, monthrange(ano, mes)[1])

    return data.replace(
        year=ano,
        month=mes,
        day=dia,
    )


def calcular_status(conta: Bill) -> str:
    if conta.status.lower() == "paga":
        return "Paga"

    agora = datetime.now()

    if conta.due_date.date() < agora.date():
        return "Atrasada"

    if conta.due_date.date() == agora.date():
        return "Vence hoje"

    return "Pendente"


def serializar(conta: Bill) -> dict:
    status_atual = calcular_status(conta)

    valor_atualizado = (
        float(conta.amount or 0)
        + float(conta.interest or 0)
        + float(conta.fine or 0)
    )

    dias_atraso = 0

    if status_atual == "Atrasada":
        dias_atraso = (
            datetime.now().date() - conta.due_date.date()
        ).days

    return {
        "id": conta.id,
        "description": conta.description,
        "category": conta.category,
        "amount": float(conta.amount or 0),
        "due_date": conta.due_date,
        "status": status_atual,
        "installments": conta.installments,
        "current_installment": conta.current_installment,
        "interest": float(conta.interest or 0),
        "fine": float(conta.fine or 0),
        "updated_amount": valor_atualizado,
        "days_overdue": dias_atraso,
        "created_at": conta.created_at,
        "user_id": conta.user_id,
    }


@router.get("/")
def listar_contas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contas = (
        db.query(Bill)
        .filter(Bill.user_id == current_user.id)
        .order_by(
            Bill.due_date.asc(),
            Bill.id.asc(),
        )
        .all()
    )

    return [serializar(conta) for conta in contas]


@router.get("/summary")
def resumo_contas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contas = (
        db.query(Bill)
        .filter(Bill.user_id == current_user.id)
        .all()
    )

    atrasadas = []
    vencendo_hoje = []
    pendentes = []

    for conta in contas:
        dados = serializar(conta)

        if dados["status"] == "Atrasada":
            atrasadas.append(dados)
        elif dados["status"] == "Vence hoje":
            vencendo_hoje.append(dados)
        elif dados["status"] == "Pendente":
            pendentes.append(dados)

    return {
        "total_atrasado": sum(
            item["updated_amount"]
            for item in atrasadas
        ),
        "quantidade_atrasadas": len(atrasadas),
        "vencendo_hoje": len(vencendo_hoje),
        "total_pendente": sum(
            item["updated_amount"]
            for item in pendentes
        ),
        "total_contas": len(contas),
    }


@router.post(
    "/",
    response_model=BillResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_conta(
    dados: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conta = Bill(
        **dados.model_dump(),
        user_id=current_user.id,
    )

    conta.status = calcular_status(conta)

    db.add(conta)
    db.commit()
    db.refresh(conta)

    return conta


@router.post(
    "/installments",
    status_code=status.HTTP_201_CREATED,
)
def criar_boleto_parcelado(
    dados: BillInstallmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valor_base = round(
        dados.total_amount / dados.installments,
        2,
    )

    diferenca = round(
        dados.total_amount
        - valor_base * dados.installments,
        2,
    )

    criadas = []

    for indice in range(dados.installments):
        valor_parcela = valor_base

        if indice == dados.installments - 1:
            valor_parcela = round(
                valor_parcela + diferenca,
                2,
            )

        vencimento = adicionar_meses(
            dados.first_due_date,
            indice,
        )

        conta = Bill(
            description=dados.description.strip(),
            category=dados.category.strip() or "Outros",
            amount=valor_parcela,
            due_date=vencimento,
            status="Pendente",
            installments=dados.installments,
            current_installment=indice + 1,
            interest=dados.interest,
            fine=dados.fine,
            user_id=current_user.id,
        )

        conta.status = calcular_status(conta)

        db.add(conta)
        criadas.append(conta)

    db.commit()

    return {
        "message": "Parcelamento criado com sucesso.",
        "installments_created": len(criadas),
        "installment_amount": valor_base,
    }


@router.put(
    "/{bill_id}",
    response_model=BillResponse,
)
def editar_conta(
    bill_id: int,
    dados: BillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conta = buscar_conta(
        bill_id,
        current_user.id,
        db,
    )

    for campo, valor in dados.model_dump().items():
        setattr(conta, campo, valor)

    conta.status = calcular_status(conta)

    db.commit()
    db.refresh(conta)

    return conta


@router.patch("/{bill_id}/pay")
def pagar_conta(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conta = buscar_conta(
        bill_id,
        current_user.id,
        db,
    )

    if conta.status.lower() == "paga":
        raise HTTPException(
            status_code=400,
            detail="Essa conta já está paga.",
        )

    valor_pago = (
        float(conta.amount or 0)
        + float(conta.interest or 0)
        + float(conta.fine or 0)
    )

    despesa = Expense(
        description=(
            f"[Conta paga] {conta.description} "
            f"{conta.current_installment}/{conta.installments}"
        ),
        amount=valor_pago,
        category=conta.category,
        user_id=current_user.id,
    )

    conta.status = "Paga"

    db.add(despesa)
    db.commit()
    db.refresh(conta)

    return {
        "message": "Conta marcada como paga.",
        "amount_paid": valor_pago,
        "bill": serializar(conta),
    }


@router.delete(
    "/{bill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_conta(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conta = buscar_conta(
        bill_id,
        current_user.id,
        db,
    )

    db.delete(conta)
    db.commit()
