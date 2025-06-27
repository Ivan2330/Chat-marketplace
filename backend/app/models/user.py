from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal, List
from datetime import datetime
from app.helpers.bson_id import PyObjectId

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Literal["admin", "expert", "client"] = "client"
    profile_image: Optional[str] = None
    about_me: Optional[str] = None
    specialties: Optional[List[str]] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    price_per_min: Optional[float] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str]
    email: Optional[EmailStr]
    profile_image: Optional[str]
    about_me: Optional[str]
    specialties: Optional[List[str]]
    rating: Optional[float]
    reviews_count: Optional[int]
    price_per_min: Optional[float]
    is_active: Optional[bool]
    role: Optional[Literal["admin", "expert", "client"]]

class UserInDB(UserBase):
    password_hash: str = Field(..., alias="password_hash")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen: Optional[datetime] = None
    minutes_left: int = 0
    package_type: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    subscription_status: Optional[str] = None
    current_period_end: Optional[datetime] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }

class UserOut(UserBase):
    id: str = Field(..., alias="_id")  # <-- Замість PyObjectId
    last_seen: Optional[datetime] = None
    minutes_left: int = 0
    package_type: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    subscription_status: Optional[str] = None
    current_period_end: Optional[datetime] = None
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }


class UserRatingUpdate(BaseModel):
    rating: float

class UserReviewsCountUpdate(BaseModel):
    reviews_count: int

class UserProfileImageUpdate(BaseModel):
    profile_image: str

class UserMinutesLeftUpdate(BaseModel):
    minutes_left: int

class UserSubscriptionStatusUpdate(BaseModel):
    subscription_status: str

class UserPricePerMinUpdate(BaseModel):
    price_per_min: float


class ReviewCreate(BaseModel):
    expert_id: str
    text: str
    author: str
    stars_count: int = Field(..., ge=1, le=5)

class ReviewOut(ReviewCreate):
    id: str = Field(..., alias="_id")
    created_at: datetime

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            PyObjectId: str
        }