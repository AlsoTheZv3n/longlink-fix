from pathlib import Path
from longlink.cli import errors
from longlink.constants import ROOT


def update_command(*, folder: str = ".") -> None:
    """Update the managed LongLink instructions in a project's AGENTS.md."""

    # Require an existing instruction file before updating its managed block.
    agents = Path(folder) / "AGENTS.md"
    if not agents.is_file():
        raise errors.Error(f"Instructions file not found: {agents}")
    content = agents.read_bytes().decode("utf-8")

    # Reject missing, duplicate, or reversed markers without modifying the file.
    start_marker = "<!-- LONGLINK:START -->"
    end_marker = "<!-- LONGLINK:END -->"
    if content.count(start_marker) != 1 or content.count(end_marker) != 1:
        raise errors.Error(f"Expected one LongLink START and END marker in {agents}")
    start = content.index(start_marker)
    end = content.index(end_marker)
    if end < start:
        raise errors.Error(f"LongLink END marker precedes START marker in {agents}")

    # Replace only the managed block, retaining all surrounding project instructions.
    template = (ROOT / ".static" / "new" / "AGENTS.md").read_text(encoding="utf-8")
    block = template[template.index(start_marker) : template.index(end_marker) + len(end_marker)]
    agents.write_bytes((content[:start] + block + content[end + len(end_marker) :]).encode("utf-8"))
    print(f"Updated LongLink instructions in {agents}")
