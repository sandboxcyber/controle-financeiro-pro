from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/backup",
    tags=["Backup"],
)

DB_PATH = Path(__file__).resolve().parents[2] / "finmaster.db"


@router.get("/download")
def download_backup(
    current_user: User = Depends(get_current_user),
):
    if not DB_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Banco de dados não encontrado.",
        )

    data = datetime.now().strftime("%Y-%m-%d_%H-%M")

    return FileResponse(
        path=DB_PATH,
        filename=f"FinMaster_Backup_{data}.db",
        media_type="application/octet-stream",
    )
