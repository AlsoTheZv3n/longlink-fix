from longlink.constants import ROOT


def test_packaged_root_resolves_runtime_and_project_resources() -> None:
    """Find shipped resources independently of a Solution's current directory."""

    # Assert
    assert ROOT.is_absolute()
    assert (ROOT / ".static" / "new" / "pyproject.toml").is_file()
    assert (ROOT / "shared" / "alembic" / "env.py").is_file()
