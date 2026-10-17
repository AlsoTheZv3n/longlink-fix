import pytest
from src.models.pagination import Pagination

pytestmark = pytest.mark.no_db


@pytest.mark.parametrize(("page", "page_size", "offset"), [(1, 25, 0), (2, 25, 25), (3, 100, 200)])
def test_pagination_computes_zero_based_offset(page: int, page_size: int, offset: int) -> None:
    """Translate one-based API page numbers into query offsets."""

    # Act
    pagination = Pagination(page=page, page_size=page_size)

    # Assert
    assert pagination.offset == offset
