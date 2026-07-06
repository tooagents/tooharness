import os
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("TooMcp", host="0.0.0.0", stateless_http=True)

FASTAPI_URL = os.environ.get("FASTAPI_URL", "http://localhost:8000")
USER_ID = "default-user"


@mcp.tool()
def save_entry(entry_type: str, text: str = "", amount: float = 0, description: str = "", category: str = "") -> str:
    """Save a classified entry. entry_type must be 'diary' or 'transaction'.
    For diary: provide text.
    For transaction: provide amount, description, and optionally category."""

    if entry_type == "diary":
        response = httpx.post(
            f"{FASTAPI_URL}/diary/",
            json={"user_id": USER_ID, "text": text},
        )
    elif entry_type == "transaction":
        payload = {"user_id": USER_ID, "amount": amount, "description": description}
        if category:
            payload["category"] = category
        response = httpx.post(
            f"{FASTAPI_URL}/transactions/",
            json=payload,
        )
    else:
        return f"Error: unknown entry_type '{entry_type}'"

    if response.status_code == 200:
        return f"Saved {entry_type} successfully."
    return f"Error saving: {response.status_code} {response.text}"


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
