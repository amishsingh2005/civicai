from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..database import supabase
import uuid

router = APIRouter(prefix="/comments", tags=["Comments"])

class CommentCreate(BaseModel):
    report_id: str
    user_id: str
    content: str
    parent_id: Optional[str] = None

@router.post("/create")
async def create_comment(comment: CommentCreate):
    try:
        data = {
            "id": str(uuid.uuid4()),
            "report_id": comment.report_id,
            "user_id": comment.user_id,
            "content": comment.content,
            "parent_id": comment.parent_id,
            "created_at": datetime.utcnow().isoformat()
        }
        
        if not supabase:
            raise HTTPException(status_code=503, detail="Comments service is currently unavailable (Supabase client not initialized). Check backend/.env for SUPABASE_URL and SUPABASE_KEY.")
            
        response = supabase.table("comments").insert(data).execute()
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        error_str = str(e)
        print(f"Supabase Error (POST): {error_str}")
        if "PGRST205" in error_str:
            raise HTTPException(
                status_code=500, 
                detail="Supabase 'comments' table is missing. Please run the SQL setup script provided in the supabase_setup_guide.md artifact."
            )
        raise HTTPException(status_code=500, detail=error_str)

@router.get("/{report_id}")
async def get_comments(report_id: str):
    try:
        if not supabase:
            return []
            
        response = supabase.table("comments")\
            .select("*")\
            .eq("report_id", report_id)\
            .order("created_at", desc=False)\
            .execute()
        
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        error_str = str(e)
        print(f"Supabase Error (GET): {error_str}")
        if "PGRST205" in error_str:
            # For GET, we can just return an empty list or a 500 with a better message
            raise HTTPException(
                status_code=500, 
                detail="Supabase 'comments' table is missing. Please run the SQL setup script provided in the supabase_setup_guide.md artifact."
            )
        raise HTTPException(status_code=500, detail=error_str)
