from src import auth
from fastapi import Query, Depends, APIRouter, HTTPException
from src.context import Context
from src.operations import databases
from src.models.users import UserUpdate, UserSummary, AdminUserSummary, UserOrganizationMembership
from src.database.services import users, organizations
from src.models.pagination import Page, Pagination

router = APIRouter()


@router.get("/me", response_model=UserSummary, dependencies=[Depends(auth.authuser)])
async def get_me(ctx: Context):
    """Return the authenticated user's details."""

    return ctx.user


@router.get("/me/organizations", response_model=list[UserOrganizationMembership], dependencies=[Depends(auth.authuser)])
async def get_my_organizations(ctx: Context):
    """Return the authenticated user's organization memberships."""

    # Return active membership response data through the Organization persistence service.
    return await organizations.memberships(ctx.database, ctx.user.id)


@router.get("/users", response_model=Page[AdminUserSummary])
async def list_users(
    ctx: Context,
    _: auth.PlatformAdmin,
    pagination: Pagination = Depends(),
    search: str = Query(default="", max_length=200),
):
    """Return all user summaries for administrator views."""

    # Search the full administrator listing before pagination.
    items, total = await users.fetch(ctx.database, pagination, search.strip())
    return {"items": items, "total": total}


@router.patch("/me", response_model=UserSummary, dependencies=[Depends(auth.authuser)])
async def patch_me(ctx: Context, payload: UserUpdate):
    """Update the authenticated user's details."""

    # Require a user before mutating the optional context identity.
    if ctx.user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Persist the authoritative profile before synchronizing independent Organization databases.
    if payload.name is not None:
        ctx.user.name = payload.name
    if payload.avatar is not None:
        ctx.user.avatar = payload.avatar

    await ctx.database.commit()

    # Await synchronization even for unchanged payloads so failed requests can be retried.
    await databases.sync_users(ctx.user.id)
    return ctx.user
