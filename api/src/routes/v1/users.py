from src import auth
from fastapi import Depends, APIRouter
from src.context import Context
from src.models.users import UserUpdate, UserSummary, UserOrganizationMembership
from src.database.services import organizations

router = APIRouter(dependencies=[Depends(auth.authuser)])


@router.get("/me", response_model=UserSummary)
async def get_me(user: auth.CurrentUser):
    """Return the authenticated user's details."""

    return user


@router.get("/me/organizations", response_model=list[UserOrganizationMembership])
async def get_my_organizations(ctx: Context, user: auth.CurrentUser):
    """Return the authenticated user's organization memberships."""

    # Return active membership response data through the Organization persistence service.
    return await organizations.memberships(ctx.database, user.id)


@router.patch("/me", response_model=UserSummary)
async def patch_me(ctx: Context, payload: UserUpdate, user: auth.CurrentUser):
    """Update the authenticated user's details."""

    # Persist the authoritative profile; Solutions refresh it on the user's next request.
    if payload.name is not None:
        user.name = payload.name
    if payload.avatar is not None:
        user.avatar = payload.avatar

    await ctx.database.commit()

    return user
