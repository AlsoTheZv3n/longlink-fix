import sys
import json
import subprocess
from pathlib import Path


def test_environment_inspection_preserves_aliases_without_exposing_defaults(tmp_path: Path) -> None:
    """Inspect authored requirements in a disposable process rather than importing Solution code here."""

    # Arrange
    (tmp_path / "settings.py").write_text(
        "from pydantic import BaseModel, Field\n"
        "class Settings(BaseModel):\n"
        "    key: str = Field(validation_alias='API_KEY', description='Provider credential')\n"
        "    optional: str = 'private-default'\n",
        encoding="utf-8",
    )
    result = tmp_path / "metadata.json"

    # Act
    subprocess.run(
        [sys.executable, "-m", "longlink.cli.environments", str(tmp_path), "settings:Settings", str(result)],
        capture_output=True,
        check=True,
        timeout=10,
    )

    # Assert
    assert json.loads(result.read_text(encoding="utf-8")) == [
        {"name": "API_KEY", "required": True, "description": "Provider credential"},
        {"name": "optional", "required": False},
    ]
