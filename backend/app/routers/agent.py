import boto3
from fastapi import APIRouter
from pydantic import BaseModel

from app.config import settings

router = APIRouter(prefix="/agent", tags=["agent"])

HARNESS_ARN = "arn:aws:bedrock-agentcore:us-east-1:822206589627:harness/myharness_TooHarness-VXRrfMABCV"


class AgentInput(BaseModel):
    text: str
    session_id: str | None = None


class AgentResponse(BaseModel):
    message: str
    session_id: str


@router.post("/classify", response_model=AgentResponse)
def classify_input(input: AgentInput):
    client = boto3.client(
        "bedrock-agentcore",
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )

    kwargs = {
        "harnessArn": HARNESS_ARN,
        "messages": [
            {
                "role": "user",
                "content": [{"text": input.text}],
            }
        ],
    }

    if input.session_id:
        kwargs["runtimeSessionId"] = input.session_id

    response = client.invoke_harness(**kwargs)

    message = ""
    session_id = input.session_id or ""

    for event in response.get("stream", []):
        if "contentBlockDelta" in event:
            delta = event["contentBlockDelta"].get("delta", {})
            if "text" in delta:
                message += delta["text"]
        if "metadata" in event:
            meta = event["metadata"]
            if "runtimeSessionId" in meta:
                session_id = meta["runtimeSessionId"]

    return AgentResponse(message=message, session_id=session_id)
