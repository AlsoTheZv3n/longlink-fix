from src import auth
from uuid import UUID
from fastapi import APIRouter
from sqlmodel import col
from sqlalchemy import select
from src.context import Context
from sqlalchemy.orm import defer
from src.database.types import attr
from src.database.services import registries
from src.models.registries import RegistryCreate, RegistryResponse
from src.database.models.registries import RegistryConnection

router = APIRouter()


@router.get("/organizations/{organization_id}/registries", response_model=list[RegistryResponse])
async def list_registries(ctx: Context, membership: auth.OrganizationMember):
    """List connection identities visible to organization members."""

    # Load only connection metadata belonging to the authorized Organization.
    result = await ctx.database.scalars(
        select(RegistryConnection)
        .options(defer(attr(RegistryConnection.credential)))
        .where(col(RegistryConnection.organization_id) == membership.organization_id)
        .order_by(col(RegistryConnection.username), col(RegistryConnection.id))
    )
    return result.all()


@router.post("/organizations/{organization_id}/registries", response_model=RegistryResponse, status_code=201)
async def create_registry(ctx: Context, payload: RegistryCreate, membership: auth.OrganizationMaintainer) -> RegistryConnection:
    """Create an organization-owned connection and queue secret synchronization."""

    # The service owns authorization and synchronization; the route commits the final command.
    connection = await registries.create(ctx.database, membership.organization_id, payload, membership.user_id)
    await ctx.database.commit()
    return connection


@router.delete("/organizations/{organization_id}/registries/{connection_id}", status_code=204)
async def delete_registry(ctx: Context, connection_id: UUID, membership: auth.OrganizationMaintainer) -> None:
    """Remove unused credentials without breaking retained deployment revisions."""

    # Commit authorized credential removal and synchronization demand together.
    await registries.delete(ctx.database, membership.organization_id, connection_id, membership.user_id)
    await ctx.database.commit()
