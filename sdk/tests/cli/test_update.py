import pytest
from pathlib import Path
from longlink.cli import errors, update
from longlink.constants import ROOT


def test_instruction_update_preserves_project_owned_content(tmp_path: Path) -> None:
    """Replace only the managed instruction block."""

    # Arrange
    instructions = tmp_path / "AGENTS.md"
    instructions.write_text("Before\n<!-- LONGLINK:START -->old<!-- LONGLINK:END -->\nAfter\n", encoding="utf-8")
    template = (ROOT / ".static" / "new" / "AGENTS.md").read_text(encoding="utf-8")
    block = template[template.index("<!-- LONGLINK:START -->") : template.index("<!-- LONGLINK:END -->") + len("<!-- LONGLINK:END -->")]

    # Act
    update.update_command(folder=str(tmp_path))

    # Assert
    assert instructions.read_text(encoding="utf-8") == f"Before\n{block}\nAfter\n"


@pytest.mark.parametrize("content", ["Unmanaged instructions", "<!-- LONGLINK:END --><!-- LONGLINK:START -->"])
def test_invalid_instruction_markers_leave_file_unchanged(tmp_path: Path, content: str) -> None:
    """Reject ambiguous ownership without destroying handwritten instructions."""

    # Arrange
    instructions = tmp_path / "AGENTS.md"
    instructions.write_text(content, encoding="utf-8")

    # Act / Assert
    with pytest.raises(errors.Error):
        update.update_command(folder=str(tmp_path))
    assert instructions.read_text(encoding="utf-8") == content
