import json
import httpx2
import pytest
import hashlib
from fastapi import Request
from pathlib import Path
from longlink import app
from longlink.app import LongLink
from longlink.database import audit


def create_runtime(tmp_path: Path, monkeypatch: pytest.MonkeyPatch, secret: str) -> LongLink:
    """Route gateway requests into a real isolated SDK identity tool."""

    # Supply a test-local frontend artifact without requiring an existing SDK build.
    frontend = tmp_path / ".static" / "web" / "index.html"
    frontend.parent.mkdir(parents=True)
    frontend.write_text("<!doctype html><html></html>", encoding="utf-8")

    # Supply the complete pinned runtime required by the SDK without building browser assets.
    runtime = frontend.parent / "views"
    runtime.mkdir()
    script = "// Gateway test runtime\n"
    styles = "/* Gateway test styles */\n"
    (runtime / "runtime.js").write_text(script, encoding="utf-8")
    (runtime / "runtime.css").write_text(styles, encoding="utf-8")
    version = hashlib.sha256(f"{script}\n{styles}".encode()).hexdigest()
    (runtime / "runtime.json").write_text(json.dumps({"version": version}), encoding="utf-8")
    monkeypatch.setattr(app, "ROOT", tmp_path)

    # Discover isolated Solution sources and services from the test directory and settings.
    (tmp_path / "src" / "views").mkdir(parents=True)
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("LONGLINK_ENV", "testing")
    monkeypatch.setenv("LONGLINK_IDENTITY_SECRET", secret)
    sdk = LongLink()

    @sdk.get("/api/identity", response_model=dict[str, str | None], operation_id="current_identity")
    async def current_identity(request: Request) -> dict[str, str | None]:
        """Expose the admitted actor and credentials at the real Solution boundary."""

        return {
            "user": str(audit.current_actor.get()),
            "cookie": request.headers.get("cookie"),
            "authorization": request.headers.get("authorization"),
        }

    # Replace only gateway network I/O; retain actual proxy, MCP, and SDK route behavior.
    transport = httpx2.ASGITransport(app=sdk)

    async def send(_transport: object, request: httpx2.Request) -> httpx2.Response:
        """Deliver the actual signed gateway request to the real SDK application."""

        return await transport.handle_async_request(request)

    monkeypatch.setattr(httpx2.AsyncHTTPTransport, "handle_async_request", send)
    return sdk
