from longlink import middleware
from longlink.middleware import frontend


def test_public_middleware_exports_match_implementations() -> None:
    """Keep public middleware exports available to embedding applications."""

    # Assert
    assert middleware.FrontendMiddleware is frontend.FrontendMiddleware
    assert middleware.accepts_gzip is frontend.accepts_gzip
