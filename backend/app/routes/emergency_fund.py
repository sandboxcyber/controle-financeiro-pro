from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.dependencies import get_current_user

from app.models.emergency_fund import EmergencyFund
from app.models.user import User

router = APIRouter(
    prefix="/emergency-fund",
    tags=["Emergency Fund"]
)


@router.get("/")
def obter(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    fundo = (
        db.query(EmergencyFund)
        .filter(
            EmergencyFund.user_id == current_user.id
        )
        .first()
    )

    if not fundo:
        fundo = EmergencyFund(
            user_id=current_user.id
        )

        db.add(fundo)
        db.commit()
        db.refresh(fundo)

    percentual = 0

    if fundo.target_amount > 0:
        percentual = round(
            fundo.current_amount /
            fundo.target_amount * 100,
            1
        )

    return {
        "current": fundo.current_amount,
        "target": fundo.target_amount,
        "monthly": fundo.monthly_contribution,
        "progress": percentual
    }
