from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core import database
from bson import ObjectId
from datetime import datetime
import asyncio
import json
from jose import jwt, JWTError
from app.core.config import settings

router = APIRouter()
active_chats = {}  # { chat_id: { user_id: websocket } }
timers = {}  # { user_id: asyncio.Task }

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
            if websocket.client_state.name != "CONNECTED":
                break
            db_user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
            if db_user.get("minutes_left", 0) <= 0:
                await websocket.send_json({"error": "Time is over, please pay to continue."})
                await websocket.close()
                break
            result = await database.db["users"].update_one(
                {"_id": ObjectId(user_id), "minutes_left": {"$gt": 0}},
                {"$inc": {"minutes_left": -1}}
            )
    except asyncio.CancelledError:
        pass

@router.websocket("/ws/chat/{chat_id}")
async def websocket_chat(websocket: WebSocket, chat_id: str, token: str = Query(...)):
    user = await get_user_from_token(token)
    if not user:
        await websocket.close()
        return

    user_id = str(user["_id"])
    user_role = user.get("role")

    await websocket.accept()

    if chat_id not in active_chats:
        active_chats[chat_id] = {}
    active_chats[chat_id][user_id] = websocket

    if user_role == "client":
        if user_id in timers:
            timers[user_id].cancel()
        task = asyncio.create_task(balance_timer(user_id, websocket))
        timers[user_id] = task

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
                text = msg_data["text"]
            except (json.JSONDecodeError, KeyError):
                await websocket.send_json({"error": "Invalid message format."})
                continue

            if user_role == "client":
                db_user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
                if db_user.get("minutes_left", 0) <= 0:
                    await websocket.send_json({"error": "Not enough time balance."})
                    await websocket.close()
                    break

            timestamp = datetime.utcnow()
            message_doc = {
                "chat_id": chat_id,
                "sender_id": user_id,
                "text": text,
                "timestamp": timestamp
            }
            await database.db["messages"].insert_one(message_doc)
            await database.db["chats"].update_one(
                {"_id": ObjectId(chat_id)},
                {"$set": {"last_message_at": timestamp}}
            )

            outgoing = {
                "chat_id": chat_id,
                "sender_id": user_id,
                "text": text,
                "timestamp": timestamp.isoformat()
            }

            for uid, conn in list(active_chats[chat_id].items()):
                try:
                    await conn.send_json(outgoing)
                except Exception:
                    try:
                        await conn.close()
                    except:
                        pass
                    active_chats[chat_id].pop(uid, None)

    except WebSocketDisconnect:
        pass
    finally:
        if chat_id in active_chats:
            active_chats[chat_id].pop(user_id, None)
            if not active_chats[chat_id]:
                active_chats.pop(chat_id)

        if user_role == "client" and user_id in timers:
            timers[user_id].cancel()
            timers.pop(user_id, None)

        try:
            await websocket.close()
        except:
            pass
