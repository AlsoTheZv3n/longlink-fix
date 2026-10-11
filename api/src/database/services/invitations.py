from datetime import UTC, datetime, timedelta
from sqlmodel import col
from sqlalchemy import delete, select
from src.database.services import billing, organizations
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.models.users import User
from src.database.models.association import UserOrganization
from src.database.models.invitations import OrganizationInvitation
from src.database.models.organizations import Organization


async def accept(session: AsyncSession, user: User) -> None:
    """Accept email grants for changed memberships in the caller's transaction."""

    # Discover recipient grants without taking invitation locks before their organization admission locks.
    result = await session.scalars(
        select(OrganizationInvitation)
        .join(Organization, col(Organization.id) == col(OrganizationInvitation.organization_id))
        .where(
            col(Organization.deleted_at).is_(None),
            col(OrganizationInvitation.email) == user.email,
        )
    )
    pending_invitations = result.all()
    if not pending_invitations:
        return

    # Keep grants active for seven days and consume expired grants without creating access.
    cutoff = datetime.now(UTC) - timedelta(days=7)
    active_invitations = [invitation for invitation in pending_invitations if invitation.created_at > cutoff]
    consumed_ids = [invitation.id for invitation in pending_invitations if invitation.created_at <= cutoff]

    # Lock organizations in a stable order so concurrent sign-ins cannot exceed Free seat limits.
    for pending in sorted(active_invitations, key=lambda invitation: str(invitation.organization_id)):
        organization = await organizations.lock(session, pending.organization_id)
        if organization.deleted_at is not None:
            continue
        invitation = await session.get(OrganizationInvitation, pending.id, populate_existing=True, with_for_update=True)
        if invitation is None or invitation.email != user.email:
            continue
        membership = await session.get(UserOrganization, (user.id, organization.id))
        if membership is None:
            if not await billing.admit_member(session, organization.id):
                # Retain blocked invitations and allow login; owners can upgrade or remove a member.
                continue
            membership = UserOrganization(
                user_id=user.id,
                organization_id=organization.id,
                role=invitation.role,
            )
            session.add(membership)
            await billing.update_seats(session, organization.id)
        consumed_ids.append(invitation.id)

    # Delete only consumed and expired grants, never grants blocked by the current plan.
    await session.execute(delete(OrganizationInvitation).where(col(OrganizationInvitation.id).in_(consumed_ids)))
