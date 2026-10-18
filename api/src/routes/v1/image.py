from src import auth
from uuid import UUID
from fastapi import Depends, APIRouter
from src.context import Context
from src.models.types import Image
from src.models.metadata import LongLinkMetadata
from src.database.services import registries, organizations

router = APIRouter()


@router.get("/image", response_model=LongLinkMetadata, dependencies=[Depends(auth.authuser)])
async def inspect_image(
    ctx: Context,
    image: Image,
    organization_id: UUID | None = None,
):
    """Inspect a container image and return its LongLink metadata."""

    # Authorize the organization before allowing any of its credentials to be tried.
    if organization_id is not None:
        await organizations.require_membership(ctx.database, ctx.user.id, organization_id)

    # Select matching credentials automatically while keeping this response metadata-only.
    metadata, _ = await registries.inspect(ctx.database, organization_id, image)
    return metadata
