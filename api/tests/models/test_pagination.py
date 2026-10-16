import pytest
from pydantic import ValidationError
from src.models.pagination import Pagination

pytestmark = pytest.mark.no_db


@pytest.mark.parametrize(("page", "page_size", "offset"), [(1, 25, 0), (2, 25, 25), (3, 100, 200)])
def test_pagination_computes_zero_based_offset(page: int, page_size: int, offset: int) -> None:
    """Translate one-based API page numbers into query offsets."""

    # Act
    pagination = Pagination(page=page, page_size=page_size)

    # Assert
    assert pagination.offset == offset


@pytest.mark.parametrize("payload", [{"page": 0}, {"page_size": 0}, {"page_size": 101}])
def test_pagination_rejects_out_of_range_bounds(payload: dict[str, int]) -> None:
    """Prevent negative offsets and unbounded collection requests."""

    # Act / Assert
    with pytest.raises(ValidationError):
        Pagination.model_validate(payload)
