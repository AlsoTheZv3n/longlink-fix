import httpx
import asyncio
import aiosmtplib
from src import auth
from kr8s import ServerError, NotFoundError, APITimeoutError, ConnectionClosedError
from uuid import UUID
from fastapi import Query, Depends, APIRouter, HTTPException
from src.utils import s3, mail, roles
from src.logger import logger
from src.context import Context
from sqlalchemy.exc import SQLAlchemyError
from src.kubernetes import databases
from src.environments import env
from src.models.roles import OrganizationRoles
from src.models.users import UserOrganizationMembership
from botocore.exceptions import ClientError, BotoCoreError
from src.models.storages import OrganizationStorageUsageResponse
from src.models.databases import OrganizationDatabaseUsageResponse
from src.models.resources import OrganizationIdentity, OrganizationSolutionSummary
from src.database.services import organizations
from src.kubernetes.client import Kubernetes
from src.models.pagination import Page, Pagination
from src.kubernetes.storage import Storage
from src.models.organizations import (
    DatabaseState,
    OrganizationUsage,
    OrganizationCreate,
    OrganizationDetails,
    OrganizationMemberUpdate,
    OrganizationQuotasResponse,
    OrganizationInvitationCreate,
)
from src.database.models.organizations import Organization

router = APIRouter()
STORAGE_USAGE_TIMEOUT_SECONDS = 15
DATABASE_USAGE_TIMEOUT_SECONDS = 15


@router.get("/organizations", response_model=Page[OrganizationIdentity])
async def list_organizations(
    ctx: Context,
    _user: auth.PlatformAdmin,
    pagination: Pagination = Depends(),
    search: str = Query(default="", max_length=200),
):
    """Return all organizations for administrator views."""

    # Search the full administrator listing before pagination.
    items, total = await organizations.fetch(ctx.database, pagination, search.strip())
    return {"items": items, "total": total}


@router.get("/organizations/slug/{organization_slug}", response_model=UserOrganizationMembership, dependencies=[Depends(auth.authuser)])
async def get_organization_by_slug(
    ctx: Context,
    organization_slug: str,
):
    """Return the current user's membership for one Organization slug."""

    # Resolve the route slug within the authenticated user's active memberships.
    membership = await organizations.membership_by_slug(ctx.database, ctx.user.id, organization_slug)
    if membership is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return membership


@router.get("/organizations/{organization_id}", response_model=OrganizationDetails)  # noqa: FAST003 - Consumed by auth.OrganizationMember.
async def get_organization(
    ctx: Context,
    membership: auth.OrganizationMember,
):
    """Return one organization and its metadata."""

    # Reuse the active Organization loaded with the authorized membership.
    organization = membership.organization

    # Show invitations only to organization managers.
    return {
        "organization": organization,
        "members": await organizations.members(ctx.database, organization.id),
        "invitations": await organizations.invitations(ctx.database, organization.id)
        if roles.atleast(membership.role, OrganizationRoles.maintain)
        else [],
    }


@router.get("/organizations/{organization_id}/solutions", response_model=list[OrganizationSolutionSummary])  # noqa: FAST003 - Consumed by auth.OrganizationMember.
async def get_organization_solutions(
    ctx: Context,
    membership: auth.OrganizationMember,
):
    """Return solutions visible to the current organization member."""

    return await organizations.solutions(ctx.database, membership.organization_id)


@router.get("/organizations/{organization_id}/usage", response_model=OrganizationUsage, dependencies=[Depends(auth.authuser)])
async def get_organization_usage(ctx: Context, organization_id: UUID):
    """Show current accepted users and the same monthly rates used for invoicing."""

    # Membership is required even though the rates themselves are public.
    await organizations.require_membership(ctx.database, ctx.user.id, organization_id)
    users = await organizations.member_count(ctx.database, organization_id)
    return {"users": users, "stripe_enabled": env.stripe_enabled}


@router.get("/organizations/{organization_id}/quotas", response_model=OrganizationQuotasResponse)
async def get_organization_quotas(
    ctx: Context,
    organization_id: UUID,
    _user: auth.PlatformAdmin,
):
    """Return stored Organization quotas for administrator views."""

    # Read stored quotas without touching provider boundaries.
    organization = await ctx.database.get(Organization, organization_id)
    if organization is None or organization.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Organization not found")
    return organization


@router.get(
    "/organizations/{organization_id}/storage",  # noqa: FAST003 - Consumed by auth.OrganizationMember.
    response_model=OrganizationStorageUsageResponse,
)
async def get_organization_storage_usage(
    ctx: Context,
    membership: auth.OrganizationMember,
):
    """Return live usage for the Organization bucket."""

    # Load the Organization's immutable storage assignment.
    compute = await organizations.storage_infrastructure(ctx.database, membership.organization_id)
    if compute is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    await ctx.database.commit()

    # Inspect the complete Organization bucket and report storage failures as unavailable.
    try:
        # Bound member-triggered full-bucket scans so slow storage cannot exhaust API request capacity.
        async with asyncio.timeout(STORAGE_USAGE_TIMEOUT_SECONDS):
            credentials = s3.Credentials(compute.storage_access_key, compute.storage_secret_key)
            storage = s3.S3(compute.storage_endpoint, credentials, compute.storage_certificate)
            usage = await storage.usage(Storage.bucket_name(membership.organization_id))
    except (TimeoutError, BotoCoreError, ClientError) as exc:
        logger.warning(
            "Storage resources unavailable for organization '%s' through registry '%s': %s",
            membership.organization.slug,
            compute.id,
            exc,
        )
        raise HTTPException(status_code=503, detail="Storage resources unavailable") from exc
    return {"space_used": usage, "quota_bytes": membership.organization.storage_quota_bytes}


@router.get(
    "/organizations/{organization_id}/database",  # noqa: FAST003 - Consumed by auth.OrganizationMember.
    response_model=OrganizationDatabaseUsageResponse,
)
async def get_organization_database_usage(
    ctx: Context,
    membership: auth.OrganizationMember,
):
    """Return live PostgreSQL usage against provisioned capacity for an authorized Organization."""

    # Read only the authorized Organization's database assignment before external I/O.
    target = await organizations.database_infrastructure(ctx.database, membership.organization_id)
    if target is None:
        raise HTTPException(status_code=404, detail="Organization not found")
    organization, compute = target
    await ctx.database.commit()

    # Usage reads never provision or repair an unavailable database.
    if organization.database_state != DatabaseState.available:
        raise HTTPException(status_code=503, detail="Database usage unavailable")

    # Bound both tunnel establishment and SQL measurement, releasing connections on every outcome.
    try:
        async with asyncio.timeout(DATABASE_USAGE_TIMEOUT_SECONDS):
            cluster = Kubernetes(
                compute.kubeconfig,
            )
            async with cluster:
                database = await databases.connection(organization, cluster)
                usage = await database.usage(organization.id)
    except (
        TimeoutError,
        OSError,
        RuntimeError,
        SQLAlchemyError,
        ServerError,
        NotFoundError,
        APITimeoutError,
        ConnectionClosedError,
        httpx.HTTPError,
    ) as exc:
        logger.warning("Database usage unavailable for organization '%s': %s", organization.id, exc)
        raise HTTPException(status_code=503, detail="Database usage unavailable") from exc

    return {"space_used": usage, "quota_bytes": organization.database_size_mib * 1024 * 1024}


@router.post("/organizations/{organization_id}/invitations", status_code=204)  # noqa: FAST003 - Consumed by auth.OrganizationMaintainer.
async def create_organization_invitation(
    ctx: Context,
    payload: OrganizationInvitationCreate,
    membership: auth.OrganizationMaintainer,
):
    """Create one invitation for an organization member."""

    # Preserve immutable delivery context before authorization refreshes the membership.
    organization_name = membership.organization.name

    await organizations.create_invitation(
        ctx.database,
        membership.organization_id,
        payload,
        membership.user_id,
    )
    await ctx.database.commit()

    # Deliver only after the invitation transaction commits, and tell the inviter when delivery fails.
    try:
        await mail.send_organization_invitation_email(payload.email, organization_name, payload.role)
    except aiosmtplib.SMTPException as exc:
        logger.warning("Invitation email delivery failed for organization '%s': %s", membership.organization_id, exc)
        raise HTTPException(
            status_code=503,
            detail="The invitation was saved, but its email could not be sent. Invite the same address again to resend it.",
        ) from exc


@router.delete("/organizations/{organization_id}/invitations/{invitation_id}", status_code=204)  # noqa: FAST003 - Consumed by auth.OrganizationMaintainer.
async def revoke_organization_invitation(
    ctx: Context,
    invitation_id: UUID,
    membership: auth.OrganizationMaintainer,
):
    """Revoke one pending Organization invitation."""

    await organizations.revoke_invitation(ctx.database, membership.organization_id, invitation_id, membership.user_id)
    await ctx.database.commit()


@router.patch("/organizations/{organization_id}/members/{member_id}", status_code=204)  # noqa: FAST003 - Consumed by auth.OrganizationAdmin.
async def update_organization_member(
    ctx: Context,
    member_id: UUID,
    payload: OrganizationMemberUpdate,
    membership: auth.OrganizationAdmin,
):
    """Update one organization member role."""

    # Persist the requested role only for an active Organization member.
    await organizations.update_member_role(
        ctx.database,
        membership.organization_id,
        member_id,
        payload.role,
        membership.user_id,
    )
    await ctx.database.commit()


@router.delete("/organizations/{organization_id}/members/{member_id}", status_code=204)  # noqa: FAST003 - Consumed by auth.OrganizationAdmin.
async def remove_organization_member(ctx: Context, member_id: UUID, membership: auth.OrganizationAdmin):
    """Revoke access so the member no longer counts toward month-end usage."""

    # The service revalidates permissions and protects the last owner under the organization lock.
    await organizations.remove_member(ctx.database, membership.organization_id, member_id, membership.user_id)
    await ctx.database.commit()


@router.delete(
    "/organizations/{organization_id}", status_code=202, response_model=OrganizationIdentity, dependencies=[Depends(auth.authuser)]
)
async def delete_organization(
    ctx: Context,
    organization_id: UUID,
):
    """Mark one Organization absent and queue lifecycle cleanup."""

    # Tombstone the Organization only after the service revalidates current ownership under its resource lock.
    result = await organizations.soft_delete(ctx.database, organization_id, ctx.user)
    if result is None:
        raise HTTPException(status_code=404, detail="Organization not found")

    await ctx.database.commit()
    return result


@router.post("/organizations", response_model=OrganizationIdentity, status_code=202, dependencies=[Depends(auth.authuser)])
async def create_organization(
    ctx: Context,
    payload: OrganizationCreate,
):
    """Create Organization desired state and queue infrastructure creation."""

    # Persist the Organization with transactionally selected infrastructure registries.
    organization = await organizations.create(
        ctx.database,
        payload.name,
        ctx.user,
    )
    await ctx.database.commit()
    return organization
