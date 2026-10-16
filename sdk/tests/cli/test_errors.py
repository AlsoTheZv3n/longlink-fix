import pytest
from longlink.cli.main import main


def test_expected_cli_failure_is_reported_without_traceback(tmp_path, capsys: pytest.CaptureFixture[str]) -> None:
    """Render the CLI's expected-error contract instead of exposing a Python traceback."""

    # Act
    with pytest.raises(SystemExit) as error:
        main(["update", "--folder", str(tmp_path)])

    # Assert
    assert error.value.code == 1
    output = capsys.readouterr().err
    assert "Instructions file not found" in output
    assert "Traceback" not in output
