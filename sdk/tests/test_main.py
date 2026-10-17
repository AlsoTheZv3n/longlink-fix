import sys
import subprocess


def test_package_execution_exposes_cli_help() -> None:
    """Support python -m longlink without requiring an installed console script."""

    # Act
    result = subprocess.run([sys.executable, "-m", "longlink", "--help"], capture_output=True, text=True, check=True, timeout=10)

    # Assert
    assert "build" in result.stdout
    assert "migrate" in result.stdout
    assert "init" in result.stdout
