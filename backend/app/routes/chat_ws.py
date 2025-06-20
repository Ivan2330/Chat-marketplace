from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core import database
from bson import ObjectId
from datetime import datetime
import asyncio
import json
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter()

active_chats = {}

async def get_user_from_token(token: str):
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        uid = payload.get("sub")
        user = await database.db["users"].find_one({"_id": ObjectId(uid)})
        if user:
            user["_id"] = str(user["_id"])
        return user
    except JWTError:
        return None

async def balance_timer(user_id: str, websocket: WebSocket):
    try:
        while True:
            await asyncio.sleep(60)
            result = await database.db["users"].update_one(
                {"_id": ObjectId(user_id), "minutes_left": {"$gt": 0}},
                {"$inc": {"minutes_left": -1}}
            )
            if result.modified_count == 0:
                await websocket.send_json({"error": "Time is over, please pay to continue."})
                try:
                    await websocket.close()
                except RuntimeError:
                    pass
                break
    except asyncio.CancelledError:
        pass

@router.websocket("/ws/chat/{chat_id}")
async def websocket_chat(websocket: WebSocket, chat_id: str, token: str = Query(...)):
    user = await get_user_from_token(token)
    if not user:
        try:
            await websocket.close()
        except RuntimeError:
            pass
        return

    user_id = str(user["_id"])
    user_role = user.get("role")

    await websocket.accept()

    if chat_id not in active_chats:
        active_chats[chat_id] = []
    active_chats[chat_id].append(websocket)

    timer = None
    if user_role == "client":
        timer = asyncio.create_task(balance_timer(user_id, websocket))

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
                text = msg_data["text"]
            except (json.JSONDecodeError, KeyError):
                await websocket.send_json({"error": "Invalid message format."})
                continue

            # ❗ Блокування повідомлення лише для клієнтів з нульовим балансом
            if user_role == "client":
                db_user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
                if db_user.get("minutes_left", 0) <= 0:
                    await websocket.send_json({"error": "Not enough time balance."})
                    try:
                        await websocket.close()
                    except RuntimeError:
                        pass
                    break

            message_doc = {
                "chat_id": chat_id,
                "sender_id": user_id,
                "text": text,
                "timestamp": datetime.utcnow()
            }

            await database.db["messages"].insert_one(message_doc)
            await database.db["chats"].update_one(
                {"_id": ObjectId(chat_id)},
                {"$set": {"last_message_at": datetime.utcnow()}}
            )

            outgoing = {
                "chat_id": chat_id,
                "sender_id": user_id,
                "text": text,
                "timestamp": datetime.utcnow().isoformat()
            }

            for connection in list(active_chats[chat_id]):
                try:
                    await connection.send_json(outgoing)
                except Exception:
                    try:
                        await connection.close()
                    except RuntimeError:
                        pass
                    active_chats[chat_id].remove(connection)

    except WebSocketDisconnect:
        pass
    finally:
        if timer:
            timer.cancel()
        if websocket in active_chats.get(chat_id, []):
            active_chats[chat_id].remove(websocket)
        if not active_chats.get(chat_id):
            active_chats.pop(chat_id, None)
        try:
            await websocket.close()
        except RuntimeError:
            pass
