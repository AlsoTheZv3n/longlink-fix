import pytest
from longlink.cli.main import main


def test_cli_help_lists_all_supported_commands(capsys: pytest.CaptureFixture[str]) -> None:
    """Expose every supported SDK command through the public entrypoint."""

    # Act
    main(["--help"])

    # Assert
    output = capsys.readouterr().out
    assert "build" in output
    assert "dev" in output
    assert "init" in output
    assert "migrate" in output
