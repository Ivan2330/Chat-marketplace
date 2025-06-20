from fastapi import APIRouter, Depends, HTTPException
from app.models.transaction import TransactionOut
from app.routes.auth import get_current_active_user
from app.models.user import UserOut
from app.core import database

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("/my", response_model=list[TransactionOut])
async def get_my_transactions(current_user: UserOut = Depends(get_current_active_user)):
    txs = await database.db["transactions"].find({"user_id": current_user.id}).to_list(100)
    for tx in txs:
        tx["_id"] = str(tx["_id"])
    return [TransactionOut(**tx) for tx in txs]

@router.get("/", response_model=list[TransactionOut])
async def get_all_transactions():
    txs = await database.db["transactions"].find().to_list(1000)
    for tx in txs:
        tx["_id"] = str(tx["_id"])
    return [TransactionOut(**tx) for tx in txs]
