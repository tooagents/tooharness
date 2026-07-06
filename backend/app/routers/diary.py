from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timezone

from app.db import get_table

router = APIRouter(prefix="/diary", tags=["diary"])


class DiaryCreate(BaseModel):
    user_id: str
    text: str


class DiaryEntry(BaseModel):
    user_id: str
    timestamp: str
    text: str


@router.post("/", response_model=DiaryEntry)
def create_diary_entry(entry: DiaryCreate):
    table = get_table("diary_entries")
    timestamp = datetime.now(timezone.utc).isoformat()

    item = {
        "user_id": entry.user_id,
        "timestamp": timestamp,
        "text": entry.text,
    }
    table.put_item(Item=item)
    return item


@router.get("/{user_id}", response_model=list[DiaryEntry])
def list_diary_entries(user_id: str, limit: int = 50):
    table = get_table("diary_entries")
    response = table.query(
        KeyConditionExpression="user_id = :uid",
        ExpressionAttributeValues={":uid": user_id},
        ScanIndexForward=False,
        Limit=limit,
    )
    return response["Items"]
