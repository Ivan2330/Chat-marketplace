from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
from app.helpers.bson_id import PyObjectId


class TransactionBase(BaseModel):
    user_id: str
    amount: float
    currency: str = "USD"
    payment_intent_id: str

class TransactionOut(TransactionBase):
    id: str = Field(..., alias="_id")
    status: str = "pending"  # pending / succeeded / failed
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str}
