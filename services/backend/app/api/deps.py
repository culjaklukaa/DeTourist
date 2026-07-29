import uuid
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db_session
from app.core.security import verify_token
from app.models.user import User

async def get_current_user(
    token_sub: str = Depends(verify_token),
    session: AsyncSession = Depends(get_db_session)
) -> User:
    try:
        user_id = uuid.UUID(token_sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid user ID format in token"
        )
        
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
        
    return user
