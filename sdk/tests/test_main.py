import sys
import subprocess
from pathlib import Path


def test_package_execution_exposes_cli_help() -> None:
    """Support python -m longlink without requiring an installed console script."""

    # Act
    result = subprocess.run([sys.executable, "-m", "longlink", "--help"], capture_output=True, text=True, check=True, timeout=10)

    # Assert
    assert "build" in result.stdout
    assert "migrate" in result.stdout
    assert "init" in result.stdout


def test_sdk_sources_and_tests_have_one_to_one_paths() -> None:
    """Keep each SDK runtime module in a single matching test file."""

    # Arrange
    tests = Path(__file__).resolve().parent
    source = tests.parent / "longlink"

    # Act
    expected = {
        module.relative_to(source).with_name(
            {"__init__.py": "test_init.py", "__main__.py": "test_main.py"}.get(module.name, f"test_{module.name}")
        )
        for module in source.rglob("*.py")
        if ".static" not in module.parts and (module.name != "__init__.py" or module.read_text(encoding="utf-8").strip())
    }
    actual = {module.relative_to(tests) for module in tests.rglob("test_*.py")}

    # Assert
    assert actual == expected, f"Missing: {sorted(expected - actual)}; unexpected: {sorted(actual - expected)}"
