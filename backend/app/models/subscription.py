from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
from app.helpers.bson_id import PyObjectId


class SubscriptionBase(BaseModel):
    user_id: str
    plan_id: str
    stripe_session_id: Optional[str] = None
    minutes_granted: int
    
class SubscriptionUpdate(BaseModel):
    plan_id: Optional[str] = None
    minutes_granted: Optional[int] = None

class SubscriptionOut(SubscriptionBase):
    id: str = Field(..., alias="_id")
    status: str = "pending"  # pending / paid / canceled
    purchased_at: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str}