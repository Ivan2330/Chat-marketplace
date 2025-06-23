from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo
from app.core import database
from app.routes import auth, users, transaction, subscription, plans, chats, chat_ws, stripe, webhook
from app.core.initialize_data import initialize_data

app = FastAPI(title="Chat Platform")

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    await database.db["users"].create_index("email", unique=True)
    await initialize_data()
    print("Connected:", database.db.name)

@app.get("/")
def root():
    return {"message": "API is running"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Заміни на конкретний домен у продакшні
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Підключення всіх роутерів
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(chats.router)
app.include_router(chat_ws.router)
app.include_router(plans.router)
app.include_router(stripe.router)
app.include_router(webhook.router)
app.include_router(transaction.router)
app.include_router(subscription.router)
