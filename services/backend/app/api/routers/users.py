from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db_session
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
async def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session)
):
    if user_in.email is not None:
        current_user.email = user_in.email
    if user_in.password is not None:
        current_user.hashed_password = get_password_hash(user_in.password)
        
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user
