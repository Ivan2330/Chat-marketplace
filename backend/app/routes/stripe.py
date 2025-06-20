from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from starlette.status import HTTP_404_NOT_FOUND
from app.core import database
from app.models.plan import PlanOut
from stripe import checkout, error as stripe_error
from datetime import datetime
import stripe
import os
from bson import ObjectId

from app.core.config import settings

router = APIRouter(prefix="/payments", tags=["payments"])

stripe.api_key = settings.stripe_secret_key

@router.post("/create-checkout-session/{plan_id}")
async def create_checkout_session(plan_id: str, user_id: str):
    try:
        plan = await database.db["plans"].find_one({"_id": ObjectId(plan_id)})
    except Exception:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Invalid Plan ID format")

    if not plan:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Plan not found")

    # 1. Спочатку створюємо Stripe сесію
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": plan["stripe_price_id"],
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{settings.frontend_url}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.frontend_url}/cancel",
            metadata={
                "user_id": user_id,
                "plan_id": plan_id,
            }
        )
    except stripe_error.StripeError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

    # 2. Додаємо subscription у БД
    await database.db["subscriptions"].insert_one({
        "user_id": user_id,
        "plan_id": plan_id,
        "minutes_granted": plan["total_minutes"],
        "status": "pending",
        "stripe_session_id": session.id,
        "purchased_at": datetime.utcnow()
    })

    # 3. Відправляємо checkout URL
    return {"checkout_url": session.url}


@router.get("/config")
async def get_stripe_config():
    return {
        "publishableKey": settings.stripe_publishable_key
    }