from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from datetime import datetime

from app.routes.auth import hash_password
from app.core import database
from app.routes.auth import get_current_active_user
from app.models.user import (
    UserOut, UserUpdate, UserCreate,
    UserRatingUpdate, UserReviewsCountUpdate,
    UserProfileImageUpdate, UserMinutesLeftUpdate,
    UserSubscriptionStatusUpdate, UserPricePerMinUpdate,
    ReviewCreate, ReviewOut
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/create", response_model=UserOut, status_code=201)
async def create_user_with_role(
    user_data: UserCreate,
    current_user: UserOut = Depends(get_current_active_user)
):
    # if current_user.role != "admin":
    #     raise HTTPException(status_code=403, detail="Access denied")

    if await database.db["users"].find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    user_doc = user_data.dict(exclude={"password"})
    user_doc["password_hash"] = hash_password(user_data.password)
    user_doc["created_at"] = datetime.utcnow()

    result = await database.db["users"].insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)

    return UserOut(**user_doc)

@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserOut = Depends(get_current_active_user)):
    return current_user


@router.get("/expert", response_model=UserOut)
async def get_expert_user():
    expert = await database.db["users"].find_one({"role": "expert"})
    if not expert:
        raise HTTPException(status_code=404, detail="Expert user not found")
    
    expert["_id"] = str(expert["_id"])
    return UserOut(**expert)


@router.get("/", response_model=list[UserOut])
async def get_all_users(current_user: UserOut = Depends(get_current_active_user)):
    users = await database.db["users"].find().to_list(length=1000)
    for user in users:
        user["_id"] = str(user["_id"])
    return [UserOut(**user) for user in users]


@router.get("/{user_id}", response_model=UserOut)
async def get_user_by_id(user_id: str, current_user: UserOut = Depends(get_current_active_user)):
    user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return UserOut(**user)


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(user_id: str, user_data: UserUpdate, current_user: UserOut = Depends(get_current_active_user)):
    update_doc = {k: v for k, v in user_data.dict(exclude_unset=True).items()}
    result = await database.db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_doc})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
    updated_user["_id"] = str(updated_user["_id"])
    return UserOut(**updated_user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, current_user: UserOut = Depends(get_current_active_user)):
    result = await database.db["users"].delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return None


@router.patch("/{user_id}/rating", response_model=UserOut)
async def update_user_rating(user_id: str, rating_update: UserRatingUpdate, current_user: UserOut = Depends(get_current_active_user)):
    result = await database.db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"rating": rating_update.rating}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
    user["_id"] = str(user["_id"])
    return UserOut(**user)


@router.patch("/{user_id}/reviews", response_model=UserOut)
async def update_user_reviews(user_id: str, reviews_update: UserReviewsCountUpdate, current_user: UserOut = Depends(get_current_active_user)):
    result = await database.db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"reviews_count": reviews_update.reviews_count}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
    user["_id"] = str(user["_id"])
    return UserOut(**user)


@router.patch("/{user_id}/profile_image", response_model=UserOut)
async def update_profile_image(user_id: str, data: UserProfileImageUpdate, current_user: UserOut = Depends(get_current_active_user)):
    result = await database.db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"profile_image": data.profile_image}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
    user["_id"] = str(user["_id"])
    return UserOut(**user)


@router.patch("/{user_id}/minutes", response_model=UserOut)
async def update_minutes_left(user_id: str, data: UserMinutesLeftUpdate, current_user: UserOut = Depends(get_current_active_user)):
    result = await database.db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"minutes_left": data.minutes_left}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
    user["_id"] = str(user["_id"])
    return UserOut(**user)


@router.patch("/{user_id}/subscription", response_model=UserOut)
async def update_subscription_status(user_id: str, data: UserSubscriptionStatusUpdate, current_user: UserOut = Depends(get_current_active_user)):
    result = await database.db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"subscription_status": data.subscription_status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
    user["_id"] = str(user["_id"])
    return UserOut(**user)


@router.patch("/{user_id}/price", response_model=UserOut)
async def update_price_per_min(user_id: str, data: UserPricePerMinUpdate, current_user: UserOut = Depends(get_current_active_user)):
    result = await database.db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": {"price_per_min": data.price_per_min}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    user = await database.db["users"].find_one({"_id": ObjectId(user_id)})
    user["_id"] = str(user["_id"])
    return UserOut(**user)


@router.post("/reviews", response_model=ReviewOut, status_code=201)
async def create_review(
    review: ReviewCreate,
    current_user: UserOut = Depends(get_current_active_user)
):
    review_doc = review.dict()
    review_doc["created_at"] = datetime.utcnow()
    result = await database.db["reviews"].insert_one(review_doc)
    review_doc["_id"] = str(result.inserted_id)
    return ReviewOut(**review_doc)


@router.get("/reviews/by_expert/{expert_id}", response_model=List[ReviewOut])
async def get_reviews_by_expert(expert_id: str):
    reviews_cursor = database.db["reviews"].find({"expert_id": expert_id})
    reviews = await reviews_cursor.to_list(length=100)
    for review in reviews:
        review["_id"] = str(review["_id"])
    return [ReviewOut(**review) for review in reviews]

