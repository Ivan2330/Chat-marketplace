from fastapi import APIRouter, Depends, HTTPException
from app.models.subscription import SubscriptionOut
from app.routes.auth import get_current_active_user
from app.models.user import UserOut
from app.core import database

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.get("/my", response_model=list[SubscriptionOut])
async def get_my_subscriptions(current_user: UserOut = Depends(get_current_active_user)):
    subs = await database.db["subscriptions"].find({"user_id": current_user.id}).to_list(100)
    for sub in subs:
        sub["_id"] = str(sub["_id"])
    return [SubscriptionOut(**sub) for sub in subs]

@router.get("/", response_model=list[SubscriptionOut])
async def get_all_subscriptions():
    subs = await database.db["subscriptions"].find().to_list(1000)
    for sub in subs:
        sub["_id"] = str(sub["_id"])
    return [SubscriptionOut(**sub) for sub in subs]
