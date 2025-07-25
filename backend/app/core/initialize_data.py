import asyncio
from datetime import datetime
from app.core import database
from app.routes.auth import hash_password


async def initialize_data():
    print("✓ MongoDB assumed connected")

    admin_email = "admin-strazen@gmail.com"
    if not await database.db["users"].find_one({"email": admin_email}):
        await database.db["users"].insert_one({
            "email": admin_email,
            "username": "admin",
            "password_hash": hash_password("strazen_admin23"),
            "role": "admin",
            "created_at": datetime.utcnow(),
            "minutes_left": 0,
            "is_active": True,
        })
        print("✅ Admin created")
    else:
        print("ℹ️ Admin already exists")

    
    expert_email = "expert-strazen@gail.com"
    if not await database.db["users"].find_one({"email": expert_email}):
        await database.db["users"].insert_one({
            "email": expert_email,
            "username": "Sofia",
            "password_hash": hash_password("strazen_expert23"),
            "role": "expert",
            "created_at": datetime.utcnow(),
            "about_me": "I’m a certified psychologist, tarot reader, and spiritual guide with over 10 years of experience helping people find clarity, healing, and direction in their lives. My sessions are a safe space where you can explore your emotions, overcome blockages, and reconnect with your inner truth.",
            "rating": 4.9,
            "reviews_count": 2550,
            "price_per_min": 3,
            "minutes_left": 0,
            "is_active": True,
        })
        print("✅ Expert created")
    else:
        print("ℹ️ Expert already exists")

    plans = [
        {
            "name": "Pro",
            "price_usd": 70,
            "minutes": 30,
            "bonus_minutes": 10,
            "total_minutes": 40,
            "stripe_price_id": "price_1Rd17LJLWV0e6A5QQBwBlvFL",
            "is_most_popular": True
        },
        {
            "name": "Starter",
            "price_usd": 40,
            "minutes": 15,
            "bonus_minutes": 5,
            "total_minutes": 20,
            "stripe_price_id": "price_1Rd172JLWV0e6A5QoSIcJ0j6",
            "is_most_popular": False
        },
        {
            "name": "Test_try",
            "price_usd": 1,
            "minutes": 18,
            "bonus_minutes": 3,
            "total_minutes": 21,
            "stripe_price_id": "price_1RnhVaJLWV0e6A5Q7g20w75B",
            "is_most_popular": False
        },
    ]

    for plan in plans:
        existing = await database.db["plans"].find_one({"stripe_price_id": plan["stripe_price_id"]})
        if not existing:
            await database.db["plans"].insert_one(plan)
            print(f"✅ Plan '{plan['name']}' created")
        else:
            print(f"ℹ️ Plan '{plan['name']}' already exists")

    print("✓ Initialization completed")


if __name__ == "__main__":
    asyncio.run(initialize_data())
