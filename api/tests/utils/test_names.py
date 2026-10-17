import pytest
from fastapi import HTTPException
from src.utils import names

pytestmark = pytest.mark.no_db


@pytest.mark.parametrize("value", [" !!! ", "a" * 64])
def test_slugify_rejects_invalid_slug(value: str) -> None:
    """Reject names that cannot produce one URL slug."""

    with pytest.raises(HTTPException, match="409: Invalid name"):
        names.slugify(value)
