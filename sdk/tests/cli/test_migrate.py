import pytest
from pathlib import Path
from longlink.cli.main import main


def test_migrate_command_keeps_an_unchanged_project_at_its_existing_revision(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    """Apply committed migrations without generating redundant schema revisions."""

    # Arrange
    main(["init", "--folder", str(tmp_path / "sample")])
    monkeypatch.chdir(tmp_path / "sample")
    monkeypatch.setenv("LONGLINK_ENV", "development")
    revisions = set(Path("migrations").glob("*.py"))

    # Act
    main(["migrate"])

    # Assert
    assert set(Path("migrations").glob("*.py")) == revisions
    assert "No migrations were created" in capsys.readouterr().out
