from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.services.finance_engine import FinanceEngine
from app.services.forecast import gerar_previsao
from app.services.financial_alerts import gerar_alertas

router = APIRouter(
    prefix="/finance",
    tags=["Finance"],
)


@router.get("/overview")
def overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    engine = FinanceEngine(db)

    receitas = engine.receitas(current_user.id)
    despesas = engine.despesas(current_user.id)

    saldo_bancos = engine.saldo_bancos(current_user.id)

    limite = engine.limite_total_cartoes(current_user.id)
    utilizado = engine.utilizado_cartoes(current_user.id)

    investimentos = engine.patrimonio_investimentos(current_user.id)

    metas = engine.metas(current_user.id)

    patrimonio = engine.patrimonio_total(current_user.id)

    return {
        "receitas": receitas,
        "despesas": despesas,
        "fluxo_caixa": receitas - despesas,

        "saldo_bancos": saldo_bancos,

        "limite_cartoes": limite,
        "cartoes_utilizado": utilizado,
        "cartoes_disponivel": max(
            limite - utilizado,
            0,
        ),

        "investimentos": investimentos,

        "patrimonio_total": patrimonio,

        "metas": metas,
    }


@router.get("/forecast")
def forecast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return gerar_previsao(
        db=db,
        user_id=current_user.id,
    )


@router.get("/alerts")
def alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "alerts": gerar_alertas(
            db=db,
            user_id=current_user.id,
        )
    }
