from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


client = None
db = None

async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.mongo_url)

    # 1️⃣ спробувати дістати default БД із URI
    db = client.get_default_database()

    # 2️⃣ якщо її нема — явно візьмемо chat_platform
    if db is None:
        db = client["chat_platform"]

    print("✓ Connected to MongoDB:", db.name)