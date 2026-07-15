import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.bank_account import BankAccount
from app.models.bank_transaction import BankTransaction
from app.models.expense import Expense
from app.models.income import Income
from app.models.user import User


router = APIRouter(
    prefix="/imports",
    tags=["Imports"],
)


def encontrar_conta(
    db: Session,
    account_id: int,
    user_id: int,
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


def converter_valor(valor: str) -> float:
    texto = str(valor or "").strip()

    if not texto:
        raise ValueError("Valor vazio")

    texto = texto.replace("R$", "").replace(" ", "")

    if "," in texto:
        texto = texto.replace(".", "").replace(",", ".")

    return float(texto)


def normalizar_tipo(tipo: str, valor: float) -> str:
    texto = str(tipo or "").strip().lower()

    tipos_entrada = {
        "entrada",
        "credito",
        "crédito",
        "receita",
        "deposito",
        "depósito",
        "credit",
    }

    tipos_saida = {
        "saida",
        "saída",
        "debito",
        "débito",
        "despesa",
        "pagamento",
        "debit",
    }

    if texto in tipos_entrada:
        return "entrada"

    if texto in tipos_saida:
        return "saida"

    return "entrada" if valor >= 0 else "saida"


@router.post("/bank-csv")
async def importar_extrato_csv(
    account_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Arquivo não informado.",
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Envie um arquivo CSV.",
        )

    conta = encontrar_conta(
        db=db,
        account_id=account_id,
        user_id=current_user.id,
    )

    conteudo = await file.read()

    texto = None

    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            texto = conteudo.decode(encoding)
            break
        except UnicodeDecodeError:
            continue

    if texto is None:
        raise HTTPException(
            status_code=400,
            detail="Não foi possível ler o arquivo.",
        )

    amostra = texto[:4096]

    try:
        dialect = csv.Sniffer().sniff(
            amostra,
            delimiters=",;",
        )
    except csv.Error:
        dialect = csv.excel
        dialect.delimiter = ";"

    leitor = csv.DictReader(
        io.StringIO(texto),
        dialect=dialect,
    )

    if not leitor.fieldnames:
        raise HTTPException(
            status_code=400,
            detail="O CSV não possui cabeçalho.",
        )

    importados = 0
    ignorados = 0
    entradas = 0.0
    saidas = 0.0
    erros: list[str] = []

    for numero_linha, linha in enumerate(leitor, start=2):
        try:
            descricao = (
                linha.get("descricao")
                or linha.get("descrição")
                or linha.get("description")
                or linha.get("historico")
                or linha.get("histórico")
                or ""
            ).strip()

            valor_texto = (
                linha.get("valor")
                or linha.get("amount")
                or linha.get("quantia")
                or ""
            )

            tipo_texto = (
                linha.get("tipo")
                or linha.get("type")
                or linha.get("natureza")
                or ""
            )

            categoria = (
                linha.get("categoria")
                or linha.get("category")
                or "Importado"
            ).strip() or "Importado"

            data_texto = (
                linha.get("data")
                or linha.get("date")
                or ""
            ).strip()

            if not descricao:
                raise ValueError("Descrição vazia")

            valor_original = converter_valor(valor_texto)
            tipo = normalizar_tipo(tipo_texto, valor_original)
            valor = abs(valor_original)

            if valor <= 0:
                raise ValueError("Valor inválido")

            data_movimento = datetime.utcnow()

            if data_texto:
                for formato in (
                    "%d/%m/%Y",
                    "%Y-%m-%d",
                    "%d-%m-%Y",
                ):
                    try:
                        data_movimento = datetime.strptime(
                            data_texto,
                            formato,
                        )
                        break
                    except ValueError:
                        continue

            movimentacao = BankTransaction(
                transaction_type=tipo,
                description=descricao,
                amount=valor,
                category=categoria,
                created_at=data_movimento,
                bank_account_id=conta.id,
                user_id=current_user.id,
            )

            db.add(movimentacao)

            if tipo == "entrada":
                conta.balance = float(conta.balance or 0) + valor
                entradas += valor

                receita = Income(
                    description=f"[{conta.bank_name}] {descricao}",
                    amount=valor,
                    category=categoria,
                    user_id=current_user.id,
                )

                db.add(receita)
            else:
                conta.balance = float(conta.balance or 0) - valor
                saidas += valor

                despesa = Expense(
                    description=f"[{conta.bank_name}] {descricao}",
                    amount=valor,
                    category=categoria,
                    user_id=current_user.id,
                )

                db.add(despesa)

            importados += 1

        except Exception as erro:
            ignorados += 1

            if len(erros) < 10:
                erros.append(
                    f"Linha {numero_linha}: {str(erro)}"
                )

    if importados == 0:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Nenhuma movimentação válida encontrada.",
                "errors": erros,
            },
        )

    db.commit()
    db.refresh(conta)

    return {
        "message": "Extrato importado com sucesso.",
        "importados": importados,
        "ignorados": ignorados,
        "total_entradas": entradas,
        "total_saidas": saidas,
        "saldo_atual": conta.balance,
        "errors": erros,
    }
