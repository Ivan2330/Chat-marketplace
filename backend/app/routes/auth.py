from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from bson import ObjectId
from fastapi.encoders import jsonable_encoder

from app.core import database
from app.core.config import settings
from app.models.user import UserCreate, UserOut, UserInDB
from app.helpers.bson_id import PyObjectId

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_minutes: int = settings.access_token_expire_minutes):
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

async def get_user_by_email(email: str):
    return await database.db["users"].find_one({"email": email})

# @router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
# async def register(user_in: UserCreate):
#     if await get_user_by_email(user_in.email):
#         raise HTTPException(status_code=400, detail="User already exists")

#     user_doc = user_in.dict(exclude={"password"})
#     user_doc["password_hash"] = hash_password(user_in.password)
#     user_doc["created_at"] = datetime.utcnow()

#     result = await database.db["users"].insert_one(user_doc)
#     user_doc["_id"] = str(result.inserted_id)  # <- ключова зміна

#     return jsonable_encoder(UserOut(**user_doc))

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    existing = await database.db["users"].find_one({"$or": [
        {"email": user.email},
        {"username": user.username}
    ]})
    if existing:
        raise HTTPException(status_code=400, detail="User with given email or username already exists")

    user_doc = user.dict(exclude={"password"})
    user_doc["password_hash"] = hash_password(user.password)
    user_doc["created_at"] = datetime.utcnow()

    result = await database.db["users"].insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)

    return jsonable_encoder(UserOut(**user_doc))

@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = await get_user_by_email(form.username)
    if not user or not verify_password(form.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return {"access_token": token, "token_type": "bearer"}

# ✅ Правильна єдина версія get_current_user
async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        uid: str = payload.get("sub")
        if uid is None:
            raise credentials_error
    except JWTError:
        raise credentials_error

    user = await database.db["users"].find_one({"_id": ObjectId(uid)})
    if not user:
        raise credentials_error

    user["_id"] = str(user["_id"])  # 👈 обов’язкова конвертація
    return UserOut(**user)

# ✅ Перевірка на активного користувача
async def get_current_active_user(current_user: UserOut = Depends(get_current_user)) -> UserOut:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user