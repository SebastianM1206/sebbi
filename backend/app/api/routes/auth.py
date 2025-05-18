from fastapi import APIRouter, HTTPException, Depends
from app.models.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: UserCreate):
    try:
        user = await supabase_service.register_user(
            name=user_data.name,
            email=user_data.email,
            password=user_data.password
        )
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    try:
        token_data = await supabase_service.login_user(
            email=user_data.email,
            password=user_data.password
        )
        return token_data
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
