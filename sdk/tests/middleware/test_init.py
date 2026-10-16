from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.testclient import TestClient
from longlink.middleware import FrontendMiddleware


def test_public_frontend_middleware_applies_html_cache_policy() -> None:
    """Keep the public middleware import usable by embedding applications."""

    # Arrange
    app = FastAPI()
    app.add_middleware(FrontendMiddleware)

    @app.get("/")
    def page() -> HTMLResponse:
        """Serve one frontend document."""

        return HTMLResponse("<html>Solution</html>")

    # Act
    response = TestClient(app).get("/")

    # Assert
    assert response.status_code == 200
    assert response.headers["cache-control"] == "no-cache"
