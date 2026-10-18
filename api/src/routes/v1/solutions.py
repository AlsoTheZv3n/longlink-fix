import io
import json
import zipfile
from src import auth
from uuid import UUID
from fastapi import Query, Depends, Response, APIRouter, HTTPException
from src.utils import roles, images
from src.logger import logger
from src.kubernetes import solutions as solution_resources
from src.environments import env
from src.models.roles import OrganizationRoles
from src.models.types import Image
from src.models.metadata import LongLinkMetadata
from src.models.solutions import SolutionPatch, SolutionCreate, SolutionResponse, SolutionUpdateCheck
from src.database.services import solutions, registries, organizations
from src.kubernetes.client import Kubernetes
from src.models.pagination import Page, Pagination
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.models.solutions import Revision, Solution

router = APIRouter()


async def update_candidate(
    session: AsyncSession, solution_id: UUID, user_id: UUID, expected_revision_id: UUID | None = None
) -> tuple[Solution, Revision, LongLinkMetadata]:
    """Inspect the repository's latest image and revalidate the desired revision."""

    # Avoid holding command locks while waiting for the container registry.
    solution = await solutions.access(session, solution_id, user_id, lock=False)
    if expected_revision_id is not None and expected_revision_id != solution.desired_revision_id:
        raise HTTPException(status_code=409, detail="Desired revision changed since review. Check again.")
    revision = await session.get(Revision, solution.desired_revision_id)
    if revision is None:
        raise HTTPException(status_code=409, detail="Solution has no desired revision")

    # Follow latest for updates, including Solutions created with a version tag or digest.
    source = Image(revision.image)
    source = Image(f"{source.registry}/{source.repository}:latest")
    revision_id = revision.id
    connection = await registries.resolve(session, solution.organization_id, revision.registry_connection_id, source)
    await session.commit()
    metadata = await images.required_metadata(source, connection)

    # Revalidate permissions and the source after inspection before returning a candidate.
    if revision.registry_connection_id is not None:
        await registries.lock(session, solution.organization_id)
    solution = await solutions.access(session, solution_id, user_id)
    if solution.desired_revision_id != revision_id:
        raise HTTPException(status_code=409, detail="Desired revision changed during inspection. Check again.")
    return solution, revision, metadata


@router.get("/solutions", response_model=Page[SolutionResponse])
async def list_solutions(
    _user: auth.PlatformAdmin,
    session: auth.Session,
    pagination: Pagination = Depends(),
    search: str = Query(default="", max_length=200),
):
    """Return all solutions for administrator views."""

    # Search the full administrator listing before pagination.
    items, total = await solutions.fetch(session, pagination, search.strip())
    return {"items": items, "total": total}


@router.post("/organizations/{organization_id}/solutions", status_code=204)  # noqa: FAST003 - Consumed by auth.OrganizationMaintainer.
async def create_solution(payload: SolutionCreate, membership: auth.OrganizationMaintainer, session: auth.Session):
    """Create Solution state and queue its explicit deployment lifecycle."""

    # Resolve immutable image metadata before creating durable Solution state.
    metadata, connection_id = await registries.inspect(session, membership.organization_id, payload.image)

    await solutions.create(
        session,
        membership.organization_id,
        payload,
        metadata=metadata,
        user_id=membership.user_id,
        registry_connection_id=connection_id,
    )
    await session.commit()


@router.get("/solutions/{solution_id}/update", response_model=SolutionUpdateCheck)
async def check_update(solution_id: UUID, user: auth.CurrentUser, session: auth.Session):
    """Inspect the repository's latest image without changing deployment state."""

    solution, revision, metadata = await update_candidate(session, solution_id, user.id)

    # Reuse the inspected version when the candidate is the current immutable image.
    current_version = metadata.version if metadata.image == revision.image else None
    if metadata.image != revision.image:
        # Release command locks before inspecting the current digest with its retained credentials.
        current_image = Image(revision.image)
        connection = await registries.resolve(session, solution.organization_id, revision.registry_connection_id, current_image)
        await session.commit()

        # An unavailable old image must not block review of an otherwise valid update.
        try:
            current_metadata = await images.required_metadata(current_image, connection)
            current_version = current_metadata.version
        except HTTPException as exc:
            if exc.status_code not in (403, 404):
                raise
            current_version = None

        # Reject stale reviews or revoked access after the additional registry lookup.
        solution = await solutions.access(session, solution_id, user.id, lock=False)
        if solution.desired_revision_id != revision.id:
            raise HTTPException(status_code=409, detail="Desired revision changed during inspection. Check again.")

    return {
        "current_image": revision.image,
        "current_version": current_version,
        "metadata": metadata,
        "revision_id": revision.id,
        "configured_envs": sorted(revision.envs),
        "min_scale": revision.min_scale,
        "idle_seconds": revision.idle_seconds,
    }


@router.post("/solutions/{solution_id}/update", status_code=204)
async def apply_update(solution_id: UUID, payload: SolutionPatch, user: auth.CurrentUser, session: auth.Session):
    """Re-resolve latest and deploy a changed immutable image or configuration."""

    solution, _revision, metadata = await update_candidate(session, solution_id, user.id, payload.expected_revision_id)

    # Compare and merge only against the current serialized desired state.
    await solutions.deploy(
        session, solution, user.id, metadata, payload.envs, min_scale=payload.min_scale, idle_seconds=payload.idle_seconds
    )
    await session.commit()


@router.get(
    "/solutions/{solution_id}/plugin",
    response_model=None,
    response_class=Response,
    responses={200: {"content": {"application/zip": {"schema": {"type": "string", "format": "binary"}}}}},
)
async def download_plugin(solution_id: UUID, user: auth.CurrentUser, session: auth.Session) -> Response:
    """Download a credential-free Agent Plugins package for one maintained Solution."""

    # Reuse maintenance access without locking or loading Solution secrets.
    solution = await solutions.access(session, solution_id, user.id, lock=False)
    name = f"longlink-{solution.id}"

    # Keep plugin identity stable and expose the selected Solution's display metadata.
    manifest = {
        "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
        "name": name,
        "version": "1.0.0",
        "description": solution.description or f"Tools for {solution.name}.",
        "extensions": {
            "com.openai": {
                "interface": {
                    "displayName": solution.name,
                    "shortDescription": "LongLink solution tools",
                    "longDescription": solution.description or f"Tools for {solution.name}.",
                    "developerName": "LongLink",
                    "category": "Productivity",
                }
            }
        },
    }
    mcp = {
        "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
        "mcpServers": {
            name: {
                "type": "streamable-http",
                "url": f"{env.PUBLIC_URL}/api/v1/solutions/{solution.id}/proxy/mcp",
            }
        },
    }

    # Put the portable manifests at the ZIP root; never bundle runtime credentials.
    content = io.BytesIO()
    with zipfile.ZipFile(content, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("plugin.json", json.dumps(manifest, indent=2) + "\n")
        archive.writestr("mcp.json", json.dumps(mcp, indent=2) + "\n")

    # Serve inert attachment bytes rather than a navigable document.
    return Response(
        content.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{name}.zip"',
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.get("/solutions/{solution_id}/logs", response_model=list[str])
async def get_solution_logs(solution_id: UUID, user: auth.CurrentUser, session: auth.Session):
    """Return recent pod logs for one managed solution."""

    # Resolve active Solution access before enforcing runtime permissions.
    access = await organizations.solution_logs_access(session, user.id, solution_id)
    if access is None:
        raise HTTPException(status_code=403, detail="Access required")
    organization_id, role, kubeconfig = access
    if not roles.atleast(role, OrganizationRoles.maintain):
        raise HTTPException(status_code=403, detail="Permission required")

    # Map expected cluster log failures to a service-unavailable response.
    try:
        cluster = Kubernetes(
            kubeconfig,
        )
        async with cluster:
            return await solution_resources.logs(cluster, organization_id, solution_id)
    except RuntimeError as exc:
        logger.warning("Solution logs unavailable for '%s': %s", solution_id, exc)
        raise HTTPException(status_code=503, detail="Solution logs unavailable")


@router.delete("/solutions/{solution_id}", status_code=204)
async def delete_solution(solution_id: UUID, user: auth.CurrentUser, session: auth.Session):
    """Mark one Solution absent and queue explicit lifecycle cleanup."""

    await solutions.delete(session, solution_id, user.id)

    await session.commit()
