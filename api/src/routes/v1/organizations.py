from src import auth
from uuid import UUID
from fastapi import Depends, APIRouter
from src.context import Context
from src.models.users import UserOrganizationMembership
from src.models.resources import OrganizationIdentity
from src.database.services import organizations
from src.models.organizations import OrganizationCreate

router = APIRouter(dependencies=[Depends(auth.authuser)])


@router.get("/organizations/slug/{organization_slug}", response_model=UserOrganizationMembership)
async def get_organization_by_slug(ctx: Context, user: auth.CurrentUser, organization_slug: str):
    """Return the current user's membership for one Organization slug."""

    # Resolve the route slug within the authenticated user's active memberships.
    return await organizations.membership_by_slug(ctx.database, user.id, organization_slug)


@router.post("/organizations", response_model=OrganizationIdentity, status_code=202)
async def create_organization(ctx: Context, user: auth.CurrentUser, payload: OrganizationCreate):
    """Create Organization desired state and queue infrastructure creation."""

    # Persist the Organization with transactionally selected infrastructure registries.
    organization = await organizations.create(ctx.database, payload.name, user)
    await ctx.database.commit()
    return organization


@router.delete("/organizations/{organization_id}", status_code=202, response_model=OrganizationIdentity)
async def delete_organization(ctx: Context, user: auth.CurrentUser, organization_id: UUID):
    """Mark one Organization absent and queue lifecycle cleanup."""

    # Tombstone the Organization only after the service revalidates current ownership under its resource lock.
    result = await organizations.soft_delete(ctx.database, organization_id, user)
    await ctx.database.commit()
    return result
