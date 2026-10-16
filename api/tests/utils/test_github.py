import httpx2
import pytest
from pydantic import SecretStr
from src.utils import github
from src.errors import InvalidError, ForbiddenError, UnavailableError

pytestmark = pytest.mark.no_db

PROVIDER_FAILURES = [
    (401, {}, InvalidError, "invalid or expired"),
    (403, {}, ForbiddenError, "denied account access"),
    (302, {}, UnavailableError, "unavailable"),
    (500, {}, UnavailableError, "unavailable"),
    (200, {"login": "invalid/name"}, UnavailableError, "invalid account profile"),
]


async def test_github_lookup_uses_fixed_authenticated_endpoint(monkeypatch: pytest.MonkeyPatch) -> None:
    """Send provider credentials only to GitHub and validate its account identity."""

    # Arrange
    requests: list[httpx2.Request] = []

    async def send(transport: object, request: httpx2.Request) -> httpx2.Response:
        """Capture the real HTTP request without external network access."""

        requests.append(request)
        return httpx2.Response(200, json={"login": "octocat"})

    monkeypatch.setattr(httpx2.AsyncHTTPTransport, "handle_async_request", send)

    # Act
    username = await github.username(SecretStr("private-token"))

    # Assert
    assert username == "octocat"
    assert len(requests) == 1
    assert str(requests[0].url) == "https://api.github.com/user"
    assert requests[0].headers["authorization"] == "Bearer private-token"


@pytest.mark.parametrize(("status", "payload", "error", "message"), PROVIDER_FAILURES)
async def test_github_provider_failures_are_classified(
    monkeypatch: pytest.MonkeyPatch, status: int, payload: dict, error: type[Exception], message: str
) -> None:
    """Expose stable domain failures instead of trusting unusable provider responses."""

    # Arrange
    async def send(transport: object, request: httpx2.Request) -> httpx2.Response:
        """Supply an external provider response."""

        return httpx2.Response(status, json=payload, headers={"Location": "https://attacker.example"})

    monkeypatch.setattr(httpx2.AsyncHTTPTransport, "handle_async_request", send)

    # Act / Assert
    with pytest.raises(error, match=message):
        await github.username(SecretStr("private-token"))
