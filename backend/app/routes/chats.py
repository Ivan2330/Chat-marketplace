from fastapi import APIRouter, HTTPException, Depends
from starlette.status import HTTP_404_NOT_FOUND, HTTP_201_CREATED
from app.models.chat import ChatCreate, ChatOut, MessageCreate, MessageOut
from app.routes.auth import get_current_active_user
from app.models.user import UserOut
from app.core import database
from datetime import datetime
from app.helpers.bson_id import PyObjectId
from bson import ObjectId
from typing import List


router = APIRouter(prefix="/chats", tags=["chats"])

@router.post("/", response_model=ChatOut)
async def create_chat(chat_in: ChatCreate):
    chat = chat_in.dict()
    chat["is_active"] = True
    chat["created_at"] = datetime.utcnow()
    chat["last_message_at"] = None

    result = await database.db["chats"].insert_one(chat)
    chat["_id"] = result.inserted_id

    # 👇 ВАЖЛИВО: Перетворити _id у str перед створенням ChatOut
    chat["_id"] = str(chat["_id"])
    return ChatOut(**chat)


@router.get("/", response_model=list[ChatOut])
async def get_all_chats(user: UserOut = Depends(get_current_active_user)):
    chats = await database.db["chats"].find().to_list(1000)
    for chat in chats:
        chat["_id"] = str(chat["_id"])
    return [ChatOut(**chat) for chat in chats]


@router.get("/my", response_model=list[ChatOut])
async def get_my_chats(user: UserOut = Depends(get_current_active_user)):
    chats = await database.db["chats"].find({
        "participants": user.id  # ❗ рядок, не ObjectId
    }).to_list(1000)
    for chat in chats:
        chat["_id"] = str(chat["_id"])
    return [ChatOut(**chat) for chat in chats]


@router.get("/init", response_model=list[ChatOut] | ChatOut)
async def init_chat(user: UserOut = Depends(get_current_active_user)):
    # --- Якщо адмін — повертаємо всі чати
    if user.role == "admin":
        chats = await database.db["chats"].find().to_list(1000)
        for chat in chats:
            chat["_id"] = str(chat["_id"])
        return [ChatOut(**chat) for chat in chats]

    # --- Якщо експерт — повертаємо чати, де він учасник
    if user.role == "expert":
        chats = await database.db["chats"].find({
            "participants": user.id
        }).to_list(1000)
        for chat in chats:
            chat["_id"] = str(chat["_id"])
        return [ChatOut(**chat) for chat in chats]

    # --- Якщо клієнт — шукаємо або створюємо чат з експертом
    expert = await database.db["users"].find_one({"role": "expert", "is_active": True})
    if not expert:
        raise HTTPException(status_code=404, detail="No available expert")

    expert_id = str(expert["_id"])
    existing_chat = await database.db["chats"].find_one({
        "participants": {"$all": [user.id, expert_id]},
        "is_active": True
    })

    if existing_chat:
        existing_chat["_id"] = str(existing_chat["_id"])
        return ChatOut(**existing_chat)

    # Створюємо новий чат
    chat_data = {
        "participants": [user.id, expert_id],
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_message_at": None,
    }
    result = await database.db["chats"].insert_one(chat_data)
    chat_data["_id"] = str(result.inserted_id)
    return ChatOut(**chat_data)


@router.get("/{chat_id}", response_model=ChatOut)
async def get_chat_by_id(chat_id: str, user: UserOut = Depends(get_current_active_user)):
    chat = await database.db["chats"].find_one({"_id": ObjectId(chat_id)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat["_id"] = str(chat["_id"])
    return ChatOut(**chat)





@router.patch("/{chat_id}", response_model=ChatOut)
async def update_chat(chat_id: str, chat_data: dict, user: UserOut = Depends(get_current_active_user)):
    await database.db["chats"].update_one({"_id": ObjectId(chat_id)}, {"$set": chat_data})
    chat = await database.db["chats"].find_one({"_id": ObjectId(chat_id)})
    chat["_id"] = str(chat["_id"])
    return ChatOut(**chat)


@router.get("/message/{chat_id}", response_model=List[MessageOut])
async def get_messages(chat_id: str):
    messages = await database.db["messages"].find({"chat_id": chat_id}).sort("timestamp", 1).to_list(length=1000)
    for msg in messages:
        msg["_id"] = str(msg["_id"])
    return messages

@router.post("/message/", response_model=MessageOut, status_code=HTTP_201_CREATED)
async def create_message(message_in: MessageCreate):
    message_doc = message_in.dict()
    message_doc["timestamp"] = datetime.utcnow()
    result = await database.db["messages"].insert_one(message_doc)
    message_doc["_id"] = str(result.inserted_id)
    return MessageOut(**message_doc)



