import pytest
from httpx2 import AsyncClient, ASGITransport
from src.mcp import MCPMiddleware
from starlette.responses import PlainTextResponse

pytestmark = pytest.mark.no_db

SOLUTION = "12345678-1234-5678-1234-567812345678"
CORS_PATHS = [
    ("/api/v1/mcp/token", True),
    ("/api/v1/mcp/consent", False),
    ("/mcp/authorize", False),
    (f"/api/v1/solutions/{SOLUTION}/proxy/mcp", True),
    (f"/api/v1/solutions/{SOLUTION}/proxy/api/data", False),
]


@pytest.mark.parametrize(("path", "cors"), CORS_PATHS)
async def test_mcp_cors_is_limited_to_public_bearer_endpoints(path: str, cors: bool) -> None:
    """Keep cookie consent and general Solution traffic outside MCP wildcard CORS."""

    # Arrange
    app = MCPMiddleware(PlainTextResponse("ok"))

    # Act
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.get(path, headers={"Origin": "https://client.example"})

    # Assert
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == ("*" if cors else None)


async def test_approval_responses_prevent_framing_and_caching() -> None:
    """Protect browser consent independently of route implementation."""

    # Arrange
    app = MCPMiddleware(PlainTextResponse("approval"))

    # Act
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
        response = await client.get("/mcp/authorize")

    # Assert
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["content-security-policy"] == "frame-ancestors 'none'"
