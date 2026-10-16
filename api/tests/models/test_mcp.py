import pytest
from pydantic import ValidationError
from src.models.mcp import TokenExchange, ClientRegistration

pytestmark = pytest.mark.no_db


def test_registration_negotiates_only_supported_grant() -> None:
    """Accept refresh-capable clients without advertising refresh-token support."""

    # Act
    client = ClientRegistration(redirect_uris=["http://localhost/callback"], grant_types=["authorization_code", "refresh_token"])

    # Assert
    assert client.grant_types == ["authorization_code"]


def test_registration_rejects_refresh_only_clients() -> None:
    """Require the grant the server actually implements."""

    # Act / Assert
    with pytest.raises(ValidationError, match="authorization_code grant is required"):
        ClientRegistration(redirect_uris=["https://client.example/callback"], grant_types=["refresh_token"])


def test_empty_exchange_fields_are_reported_as_missing() -> None:
    """Keep model-backed form validation compatible with required Form fields."""

    # Act
    with pytest.raises(ValidationError) as error:
        TokenExchange.model_validate({"code": ""})

    # Assert
    assert {"loc": ("code",), "type": "missing"}.items() <= error.value.errors()[0].items()
