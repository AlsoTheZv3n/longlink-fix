import pytest
from src.database.services import mcp

pytestmark = pytest.mark.no_db


def test_pkce_challenge_matches_rfc7636_vector() -> None:
    """Use interoperable S256 encoding without base64 padding."""

    # Act
    challenge = mcp.challenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")

    # Assert
    assert challenge == "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"


def test_redirect_preserves_callback_query_and_encodes_oauth_state() -> None:
    """Append proof without treating characters in state as query parameters."""

    # Act
    redirect = mcp.redirect("https://client.example/callback?tenant=acme&empty=", {"code": "proof", "state": "a&b=c"})

    # Assert
    assert redirect == "https://client.example/callback?tenant=acme&empty=&code=proof&state=a%26b%3Dc"
