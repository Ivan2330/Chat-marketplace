from fastapi import APIRouter, Request, Header, HTTPException
import stripe
from app.core.config import settings
from app.core import database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/webhook", tags=["webhook"])

stripe.api_key = settings.stripe_secret_key

@router.post("/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.stripe_webhook_secret
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["user_id"]
        plan_id = session["metadata"]["plan_id"]

        print("✅ Stripe webhook received for user:", user_id)
        print("➡️ Plan ID:", plan_id)
        print("➡️ Session ID:", session["id"])

        # Оновлюємо статус підписки
        await database.db["subscriptions"].update_one(
            {"stripe_session_id": session["id"]},
            {"$set": {"status": "paid"}}
        )

        sub = await database.db["subscriptions"].find_one({
            "stripe_session_id": session["id"]
        })

        if not sub:
            print("❌ Subscription not found for session:", session["id"])
            return {"received": True}

        print("🧾 Subscription found:", sub)

        # Створюємо транзакцію
        await database.db["transactions"].insert_one({
            "user_id": user_id,
            "amount": session["amount_total"] / 100,
            "currency": session["currency"].upper(),
            "payment_intent_id": session["payment_intent"],
            "status": "succeeded",
            "created_at": datetime.utcnow()
        })

        # Додаємо хвилини
        await database.db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"minutes_left": sub["minutes_granted"]}}
        )

        print(f"✅ Added {sub['minutes_granted']} minutes to user {user_id}")

    return {"received": True}

