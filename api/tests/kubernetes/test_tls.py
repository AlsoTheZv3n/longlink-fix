import base64
import pytest
from conftest import kubernetes_client
from src.kubernetes import tls

pytestmark = pytest.mark.no_db

CERTIFICATE = """-----BEGIN CERTIFICATE-----
MIIBhjCCASugAwIBAgIUaroYj0qCR9710sCR1wcSoCpSdlYwCgYIKoZIzj0EAwIw
GDEWMBQGA1UEAwwNbG9uZ2xpbmstdGVzdDAeFw0yNjEwMTYwOTM5MDRaFw0yNjEw
MTcwOTM5MDRaMBgxFjAUBgNVBAMMDWxvbmdsaW5rLXRlc3QwWTATBgcqhkjOPQIB
BggqhkjOPQMBBwNCAATfV7rrs1whxoJLLEQN8WYIWD1/12xrOAahKmaVQr5FYaFL
0bAUgZ4HIR2jVV55nx/4lGoHQXmAYaUXOAlaZ0Kqo1MwUTAdBgNVHQ4EFgQUAgDj
atEooydZjC8geNQV2C8uID8wHwYDVR0jBBgwFoAUAgDjatEooydZjC8geNQV2C8u
ID8wDwYDVR0TAQH/BAUwAwEB/zAKBggqhkjOPQQDAgNJADBGAiEAuAYSuMB/Yg8K
Yfk9JVeTL2Vmdlv18UUcKYdmEpj+ZtcCIQC3bEzu0sEklPF8Gf9lW1Ku/7XKe4uX
uCtTVjiqFnYv8w==
-----END CERTIFICATE-----
"""

INVALID_CERTIFICATES = [{}, {"tls.crt": 12}, {"tls.crt": "not base64"}, {"tls.crt": base64.b64encode(b"not a certificate").decode()}]


@pytest.mark.parametrize("data", INVALID_CERTIFICATES)
async def test_certificate_rejects_missing_or_invalid_trust_data(monkeypatch: pytest.MonkeyPatch, data: dict) -> None:
    """Do not admit unusable Kubernetes trust material as a client certificate."""

    # Arrange
    async def refresh(secret: tls.Secret) -> None:
        """Supply the Secret observation without contacting Kubernetes."""

        secret.raw["data"] = data

    monkeypatch.setattr(tls.Secret, "refresh", refresh)

    # Act / Assert
    with pytest.raises(ValueError, match="system/gateway must contain a .*certificate"):
        await tls.certificate(kubernetes_client(), "system", "gateway")


async def test_certificate_decodes_selected_ca_entry(monkeypatch: pytest.MonkeyPatch) -> None:
    """Read CA data from its named key and validate it with the real SSL parser."""

    # Arrange
    async def refresh(secret: tls.Secret) -> None:
        """Supply valid trust data at the Kubernetes transport boundary."""

        secret.raw["data"] = {"ca.crt": base64.b64encode(CERTIFICATE.encode()).decode()}

    monkeypatch.setattr(tls.Secret, "refresh", refresh)

    # Act
    result = await tls.certificate(kubernetes_client(), "system", "database-ca", entry="ca.crt")

    # Assert
    assert result == CERTIFICATE
