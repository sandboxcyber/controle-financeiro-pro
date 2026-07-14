from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.services.reports.pdf_report import gerar_relatorio_pdf

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get("/financial.pdf")
def baixar_relatorio_financeiro(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    arquivo = gerar_relatorio_pdf(
        db=db,
        user_id=current_user.id,
        nome_usuario=current_user.name,
    )

    data = datetime.now().strftime("%Y-%m-%d")

    return StreamingResponse(
        arquivo,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="finmaster-relatorio-{data}.pdf"'
            )
        },
    )
