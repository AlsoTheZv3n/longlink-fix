import pytest
import logging
from src.logger import logger

pytestmark = pytest.mark.no_db


def test_operation_logs_use_platform_namespace(caplog: pytest.LogCaptureFixture) -> None:
    """Keep worker failures attributable to the Platform operation logger."""

    # Act
    with caplog.at_level(logging.ERROR, logger="longlink.operations"):
        logger.error("Reconciliation failed")

    # Assert
    assert [(record.name, record.getMessage()) for record in caplog.records] == [("longlink.operations", "Reconciliation failed")]
