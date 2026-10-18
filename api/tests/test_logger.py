import pytest
import logging
from src.logger import logger

pytestmark = pytest.mark.no_db


def test_operation_logger_remains_registered() -> None:
    """Keep the configured Platform operation logger available."""

    # Assert the logger remains registered without emitting application logs.
    assert logger is logging.getLogger("longlink.operations")
    assert logger.handlers
