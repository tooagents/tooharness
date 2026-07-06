from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timezone

from app.db import get_table

router = APIRouter(prefix="/transactions", tags=["transactions"])


class TransactionCreate(BaseModel):
    user_id: str
    amount: float
    description: str
    category: str | None = None


class Transaction(BaseModel):
    user_id: str
    timestamp: str
    amount: str
    description: str
    category: str | None = None


@router.post("/", response_model=Transaction)
def create_transaction(tx: TransactionCreate):
    table = get_table("transactions")
    timestamp = datetime.now(timezone.utc).isoformat()

    item = {
        "user_id": tx.user_id,
        "timestamp": timestamp,
        "amount": str(tx.amount),
        "description": tx.description,
    }
    if tx.category:
        item["category"] = tx.category

    table.put_item(Item=item)
    return item


@router.get("/{user_id}", response_model=list[Transaction])
def list_transactions(user_id: str, limit: int = 50):
    table = get_table("transactions")
    response = table.query(
        KeyConditionExpression="user_id = :uid",
        ExpressionAttributeValues={":uid": user_id},
        ScanIndexForward=False,
        Limit=limit,
    )
    return response["Items"]
