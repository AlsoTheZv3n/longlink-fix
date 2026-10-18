import pytest
from pydantic import ValidationError
from src.models.solutions import SolutionPatch, SolutionCreate

pytestmark = pytest.mark.no_db

INVALID_IDLE_SECONDS = [pytest.param(29, id="below-minimum"), pytest.param(3601, id="above-maximum"), pytest.param(-1, id="negative")]
VALID_IDLE_SECONDS = [pytest.param(0, id="never-sleep"), pytest.param(30, id="minimum"), pytest.param(3600, id="maximum")]


@pytest.mark.parametrize("model", [SolutionCreate, SolutionPatch])
@pytest.mark.parametrize(
    ("envs", "match"),
    [
        pytest.param({"LONGLINK_DATABASE_HOST": "database.example"}, "reserved for the LongLink Platform", id="reserved-prefix"),
        pytest.param({"BAD-NAME": "value"}, "is invalid", id="invalid-name"),
        pytest.param({"A": "x" * 32769}, "value is too long", id="value-too-long"),
        pytest.param({f"ENV_{index}": "value" for index in range(101)}, "too many variables", id="too-many"),
        pytest.param({"A" * 254: "value"}, "is too long", id="name-too-long"),
        pytest.param({f"ENV_{index}": "x" * 32768 for index in range(17)}, "too large", id="total-too-large"),
    ],
)
def test_solution_models_reject_invalid_environment_variables(
    model: type[SolutionCreate] | type[SolutionPatch], envs: dict[str, str], match: str
) -> None:
    """Reject environment variables that the runtime cannot safely own."""

    # Invalid environment values fail at the API model boundary.
    with pytest.raises(ValidationError, match=match):
        model.model_validate({"name": "Dashboard", "image": "ghcr.io/longlink/dashboard:latest", "envs": envs})


@pytest.mark.parametrize("name", ["LONGLINK_DATABASE_HOST", "BAD-NAME"])
def test_solution_patch_rejects_invalid_environment_removal_names(name: str) -> None:
    """Reject reserved and malformed variable names even when requesting removal."""

    # Act and assert
    with pytest.raises(ValidationError) as error:
        SolutionPatch.model_validate({"envs": {name: None}})

    # Assert
    assert error.value.errors()[0]["loc"] == ("envs",)
    assert error.value.errors()[0]["type"] == "value_error"


@pytest.mark.parametrize("model", [SolutionCreate, SolutionPatch])
@pytest.mark.parametrize("idle_seconds", INVALID_IDLE_SECONDS)
def test_solution_models_reject_invalid_idle_seconds(model: type[SolutionCreate] | type[SolutionPatch], idle_seconds: int) -> None:
    """Reject scale-to-zero timeouts outside the never-sleep zero or 30-3600 contract."""

    # Both models share the idle-seconds validator at the API model boundary.
    payload = {"name": "Dashboard", "image": "ghcr.io/longlink/dashboard:latest", "idle_seconds": idle_seconds}

    # Act and assert
    with pytest.raises(ValidationError):
        model.model_validate(payload)


@pytest.mark.parametrize("model", [SolutionCreate, SolutionPatch])
@pytest.mark.parametrize("idle_seconds", VALID_IDLE_SECONDS)
def test_solution_models_accept_idle_seconds_boundaries(model: type[SolutionCreate] | type[SolutionPatch], idle_seconds: int) -> None:
    """Accept never-sleep zero and the bounded scale-to-zero timeout edges."""

    # Act
    solution = model.model_validate({"name": "Dashboard", "image": "ghcr.io/longlink/dashboard:latest", "idle_seconds": idle_seconds})

    # Assert
    assert solution.idle_seconds == idle_seconds
