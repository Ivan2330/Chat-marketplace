from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
from app.helpers.bson_id import PyObjectId

class PlanBase(BaseModel):
    name: str
    minutes: int
    bonus_minutes: int
    total_minutes: int
    price_usd: float
    stripe_price_id: str
    is_most_popular: bool = False
    
class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    minutes: Optional[int] = None
    bonus_minutes: Optional[int] = None
    total_minutes: Optional[int] = None
    price_usd: Optional[float] = None
    is_most_popular: Optional[bool] = None

class PlanOut(PlanBase):
    id: str = Field(..., alias="_id")
    
    class Config:
        allow_population_by_field_name = True
        json_encoders = {PyObjectId: str}