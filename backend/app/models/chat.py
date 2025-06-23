from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal, List
from datetime import datetime
from app.helpers.bson_id import PyObjectId

class MessageBase(BaseModel):
    chat_id: str
    sender_id: str
    text: str
    
class MessageCreate(MessageBase):
    pass


class MessageOut(MessageBase):
    id: str = Field(..., alias="_id")
    timestamp: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str}


class ChatBase(BaseModel):
    participants: List[str]

class ChatCreate(ChatBase):
    pass

class ChatOut(ChatBase):
    id: str = Field(..., alias="_id")
    is_active: bool = True
    created_at: datetime
    last_message_at: Optional[datetime] = None
    usernames: Optional[List[str]] = []
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str}
