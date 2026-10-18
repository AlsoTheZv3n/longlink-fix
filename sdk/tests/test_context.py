import pytest
from uuid import UUID
from types import SimpleNamespace
from fastapi import FastAPI
from longlink import context, identity
from contextlib import asynccontextmanager
from longlink.app import LongLink
from collections.abc import AsyncGenerator
from fastapi.testclient import TestClient
from longlink.responses import FileResponse
from longlink.testclient import TestClient as SolutionTestClient
from longlink.middleware.identity import IdentityMiddleware

IDENTITY_SECRET = "test-identity-secret-01234567890"


@pytest.mark.usefixtures("solution_source")
@pytest.mark.parametrize("download", [False, True], ids=["preview", "download"])
def test_context_streams_stored_files(download: bool, monkeypatch: pytest.MonkeyPatch) -> None:
    """Serve real context previews and downloads with encoded display filenames."""

    # Arrange
    monkeypatch.setenv("LONGLINK_ENV", "testing")
    app = LongLink()
    client = SolutionTestClient(app)
    app.state.longlink.storage.pipe_file("stored.bin", b"stored report")

    @app.get("/api/report", response_class=FileResponse)
    async def report(value: context.Context) -> FileResponse:
        """Use the public helper with a path distinct from its display name."""

        # Select the public disposition helper without replacing request services.
        if download:
            return value.download("stored.bin", filename="résumé.txt", media_type="text/plain")
        return value.file("stored.bin", filename="résumé.txt", media_type="text/plain")

    # Act
    with client:
        response = client.get("/api/report")

    # Assert
    disposition = "attachment" if download else "inline"
    assert response.status_code == 200
    assert response.content == b"stored report"
    assert response.headers["content-type"] == "text/plain; charset=utf-8"
    assert response.headers["content-disposition"] == f"{disposition}; filename*=utf-8''r%C3%A9sum%C3%A9.txt"


class RequestDatabase:
    """Record user lookups and session cleanup at the request database boundary."""

    def __init__(self) -> None:
        """Initialize an authenticated user and isolated session observations."""

        # Keep each request test's user and observations independent.
        self.user: object | None = object()
        self.lookups: list[tuple[object, UUID]] = []
        self.session_closed = False

    async def get(self, model: object, user_id: UUID) -> object | None:
        """Record the audit-user lookup and return the configured user."""

        # Observe the identity passed through the real context dependency.
        self.lookups.append((model, user_id))
        return self.user

    @asynccontextmanager
    async def session(self) -> AsyncGenerator["RequestDatabase"]:
        """Yield the test session and record finalization on every exit path."""

        # Preserve cleanup observations for both successful and failing endpoints.
        try:
            yield self
        finally:
            self.session_closed = True


def identity_headers(user_id: UUID) -> dict[str, str]:
    """Build one current Platform identity assertion for context tests."""

    # Use the shared token constructor used by the Platform gateway.
    return {"x-longlink-identity": identity.create_identity_token(user_id, IDENTITY_SECRET)}


@pytest.mark.parametrize(
    ("identity", "user"),
    [
        pytest.param(UUID("00000000-0000-0000-0000-000000000001"), object(), id="authenticated"),
        pytest.param(UUID("00000000-0000-0000-0000-000000000002"), None, id="deleted-user"),
        pytest.param(None, None, id="anonymous"),
    ],
)
def test_data_resolves_request_services(identity: UUID | None, user: object | None) -> None:
    """Yield request services only when an identity resolves to a user."""

    # Arrange
    request_database = RequestDatabase()
    storage = object()
    request_database.user = user
    app = FastAPI()
    app.state.longlink = SimpleNamespace(storage=storage, database=request_database)
    app.add_middleware(IdentityMiddleware, identity_secret=IDENTITY_SECRET, require_identity=False, local_user_id=None)

    @app.get("/")
    async def get_context(value: context.Context) -> dict[str, bool]:
        """Expose dependency values for the request-boundary test."""

        return {"user_matches": value.user is user, "storage_matches": value.storage is storage}

    client = TestClient(app)

    # Act
    with client:
        response = client.get("/", headers={} if identity is None else identity_headers(identity))

    # Assert
    if user is None:
        assert response.status_code == 401
    else:
        assert response.status_code == 200
        assert response.json() == {"user_matches": True, "storage_matches": True}
    assert request_database.lookups == ([] if identity is None else [(context.User, identity)])
    assert request_database.session_closed


def test_data_closes_database_session_when_endpoint_fails() -> None:
    """Close the request database session when a dependent endpoint raises."""

    # Arrange
    request_database = RequestDatabase()
    app = FastAPI()
    app.state.longlink = SimpleNamespace(storage=object(), database=request_database)
    app.add_middleware(IdentityMiddleware, identity_secret=IDENTITY_SECRET, require_identity=False, local_user_id=None)

    @app.get("/")
    async def fail(_value: context.Context) -> None:
        """Fail after the context dependency opens its session."""

        raise RuntimeError("endpoint failed")

    # Act
    with TestClient(app) as client, pytest.raises(RuntimeError):
        client.get("/", headers=identity_headers(UUID("00000000-0000-0000-0000-000000000001")))

    # Assert
    assert request_database.session_closed
