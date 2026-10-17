import { z } from 'zod';
import { api } from '@/lib/api';
import { useState } from 'react';
import Registries from './Registries';
import { useApiError } from '@/lib/errors';
import { useApi } from '@/lib/hooks/use-api';
import { NoIndex } from '@/components/NoIndex';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import SolutionManagement from './SolutionManagement';
import { ApiBoundary } from '@/components/ApiBoundary';
import { MoreMenu } from '@astryxdesign/core/MoreMenu';
import { Selector } from '@astryxdesign/core/Selector';
import { TextInput } from '@astryxdesign/core/TextInput';
import { DialogClose } from '@/components/ui/DialogClose';
import { SideNavItem } from '@/components/ui/SideNavItem';
import { Stack, StackItem } from '@astryxdesign/core/Stack';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { useLocation, useOutletContext } from 'react-router';
import { Table, proportional } from '@astryxdesign/core/Table';
import { DeletionDialog } from '@/platform/components/Deletion';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import * as schemas from '@/lib/generated/platform-api-v1/zod.gen';
import { SideNav, SideNavSection } from '@astryxdesign/core/SideNav';
import { Layout, LayoutPanel, LayoutContent } from '@astryxdesign/core/Layout';
import { ArrowUp, Boxes, Building2, CheckCheck, EyeOff, Users, UserRound, Wrench } from 'lucide-react';

const organizationSections = [
    { id: 'general', label: 'General' },
    { id: 'billing', label: 'Billing' },
    { id: 'private-registries', label: 'Private registries' },
];

const peopleSections = [
    { id: 'members', label: 'Members' },
    { id: 'invitations', label: 'Invitations' },
];

/** Shares organization identity and permissions while sections own resource lifetimes. */
export default function OrganizationSettings() {
    const membership = useOutletContext<z.output<typeof schemas.zUserOrganizationMembership>>();

    const base = `/api/v1/organizations/${membership.organization.id}`;
    const location = useLocation();

    // Unknown fragments select General; inactive sections never mount their queries or drafts.
    const section =
        [...organizationSections, ...peopleSections, { id: 'solutions', label: 'Solutions' }].find(
            (item) => `#${item.id}` === (location.hash === '#usage' ? '#billing' : location.hash)
        )?.id ?? 'general';

    // Share the layout-resolved identity and permissions without loading inactive sections.
    const canMaintain = ['maintain', 'admin', 'owner'].includes(membership.role);
    const canAdminister = ['admin', 'owner'].includes(membership.role);

    return (
        <Stack gap={8}>
            <NoIndex title="Organization Settings | LongLink" />
            <Stack direction="horizontal" gap={3} align="center">
                <Avatar kind="organization" name={membership.organization.name} />
                <Stack gap={0}>
                    <Heading level={4} accessibilityLevel={1}>
                        {membership.organization.name}
                    </Heading>
                    <Text type="supporting">Organization</Text>
                </Stack>
            </Stack>
            <Layout
                height="auto"
                start={
                    <LayoutPanel
                        isScrollable={false}
                        label="Settings navigation"
                        padding={0}
                        role="navigation"
                        width={260}
                    >
                        <SideNav className="h-auto w-full pr-4 [&>div:first-child]:pt-0 [&_.astryx-side-nav-section>div:first-child]:pt-0 [&_.astryx-side-nav-section>div:first-child]:pl-0">
                            <SideNavSection title="Settings" isHeaderHidden className="pt-0">
                                <SideNavItem
                                    collapsible={{ defaultIsCollapsed: true }}
                                    icon={<Building2 className="size-4" aria-hidden="true" />}
                                    label="Organization"
                                >
                                    {organizationSections.map((item) => (
                                        <SideNavItem
                                            href={`${location.pathname}${location.search}#${item.id}`}
                                            isSelected={section === item.id}
                                            key={item.id}
                                            label={item.label}
                                        />
                                    ))}
                                </SideNavItem>
                                <SideNavItem
                                    collapsible={{ defaultIsCollapsed: true }}
                                    icon={<Users className="size-4" aria-hidden="true" />}
                                    label="People"
                                >
                                    {peopleSections.map((item) => (
                                        <SideNavItem
                                            href={`${location.pathname}${location.search}#${item.id}`}
                                            isSelected={section === item.id}
                                            key={item.id}
                                            label={item.label}
                                        />
                                    ))}
                                </SideNavItem>
                                <SideNavItem
                                    href={`${location.pathname}${location.search}#solutions`}
                                    icon={<Boxes className="size-4" aria-hidden="true" />}
                                    isSelected={section === 'solutions'}
                                    label="Solutions"
                                />
                            </SideNavSection>
                        </SideNav>
                    </LayoutPanel>
                }
            >
                <Stack gap={3}>
                    {section === 'billing' ? (
                        <BillingSection base={base} />
                    ) : section === 'private-registries' ? (
                        <ApiBoundary key="registries">
                            <Registries base={base} canMaintain={canMaintain} />
                        </ApiBoundary>
                    ) : section === 'members' ? (
                        <ApiBoundary key="members">
                            <MembersSection base={base} canAdminister={canAdminister} />
                        </ApiBoundary>
                    ) : section === 'invitations' ? (
                        <ApiBoundary key="invitations">
                            <InvitationsSection base={base} canMaintain={canMaintain} />
                        </ApiBoundary>
                    ) : section === 'solutions' ? (
                        <ApiBoundary key="solutions">
                            <SolutionManagement
                                organization={membership.organization}
                                canMaintain={canMaintain}
                                presentation="settings"
                            />
                        </ApiBoundary>
                    ) : (
                        <ApiBoundary>
                            <GeneralSection
                                base={base}
                                name={membership.organization.name}
                                canDelete={membership.role === 'owner'}
                            />
                        </ApiBoundary>
                    )}
                </Stack>
            </Layout>
        </Stack>
    );
}

/** Shows owner-only organization deletion with explicit confirmation. */
function GeneralSection({ base, name, canDelete }: { base: string; name: string; canDelete: boolean }) {
    const [isConfirming, setIsConfirming] = useState(false);

    return (
        <Stack gap={4}>
            <Stack justify="end" minHeight="var(--size-element-md)">
                <Heading level={2} hasCapsize>
                    General
                </Heading>
            </Stack>
            <Divider />
            {canDelete && (
                <Stack gap={3}>
                    <Stack className="text-red-600 dark:text-red-400">
                        <Heading level={3} color="inherit">
                            Danger zone
                        </Heading>
                    </Stack>
                    <Stack
                        direction="horizontal"
                        justify="between"
                        align="center"
                        wrap="wrap"
                        gap={4}
                        padding={4}
                        className="rounded-lg border border-red-600 dark:border-red-400"
                    >
                        <Stack gap={0}>
                            <Text weight="bold">Delete this organization</Text>
                            <Text color="secondary">Once deleted, it will be gone forever. Please be certain.</Text>
                        </Stack>
                        <Button label="Delete" variant="destructive" onClick={() => setIsConfirming(true)} />
                    </Stack>
                </Stack>
            )}
            <DeletionDialog
                confirmation={
                    isConfirming
                        ? {
                              title: 'Delete organization',
                              description: `Delete ${name}? Once deleted, it will be gone forever. Please be certain.`,
                              onDelete: async () => {
                                  // Leave the deleted organization only after the server accepts deletion.
                                  await api.delete(base);
                                  window.location.assign('/user/organizations');
                              },
                          }
                        : null
                }
                onClose={() => setIsConfirming(false)}
            />
        </Stack>
    );
}

/** Owns role-change confirmation only while the members section is active. */
function MembersSection({ base, canAdminister }: { base: string; canAdminister: boolean }) {
    const [member, setMember] = useState<{
        id: string;
        name: string;
        role: string;
    } | null>(null);

    // Load and invalidate People data only while the members section is active.
    const [{ members }, invalidateDetails] = useApi(base, schemas.zOrganizationDetails);

    return (
        <>
            <Stack gap={4}>
                <Stack justify="end" minHeight="var(--size-element-md)">
                    <Heading level={2} hasCapsize>
                        Members
                    </Heading>
                </Stack>
                <Divider />
                <Table
                    data={members}
                    idKey={(row) => row.user.id}
                    hasHover
                    density="compact"
                    columns={[
                        {
                            key: 'user',
                            header: 'User',
                            width: proportional(1),
                            renderCell: (row) => (
                                <Stack direction="horizontal" gap={3} align="center">
                                    <Avatar name={row.user.name} src={row.user.avatar} seed={row.user.id} />
                                    <Stack align="start">
                                        <Stack direction="horizontal" gap={1} align="center">
                                            <Text>{row.user.name}</Text>
                                            <Text type="supporting">{row.role}</Text>
                                        </Stack>
                                        <Text type="supporting">{row.user.email}</Text>
                                    </Stack>
                                </Stack>
                            ),
                        },
                        ...(canAdminister
                            ? [
                                  {
                                      key: 'role',
                                      header: 'Actions',
                                      align: 'end' as const,
                                      width: proportional(0.5),
                                      renderCell: (row: z.output<typeof schemas.zOrganizationMemberAccessResponse>) => (
                                          <MoreMenu
                                              alignment="end"
                                              items={['read', 'write', 'maintain', 'admin'].flatMap((role) =>
                                                  role === row.role
                                                      ? []
                                                      : [
                                                            {
                                                                id: role,
                                                                label: `Set as ${role[0].toUpperCase() + role.slice(1)}`,
                                                                onClick: () =>
                                                                    setMember({
                                                                        id: row.user.id,
                                                                        name: row.user.name,
                                                                        role,
                                                                    }),
                                                            },
                                                        ]
                                              )}
                                          />
                                      ),
                                  },
                              ]
                            : []),
                    ]}
                />
            </Stack>
            {member && (
                <Dialog
                    isOpen
                    purpose="form"
                    onOpenChange={(open) => {
                        if (!open) setMember(null);
                    }}
                >
                    <DialogHeader title="Change role" onOpenChange={() => setMember(null)} />
                    <Stack gap={3}>
                        <Text color="secondary">
                            Change {member.name} to {member.role}?
                        </Text>
                        <Stack direction="horizontal" gap={2} justify="end">
                            <Button label="Cancel" variant="ghost" onClick={() => setMember(null)} />
                            <Button
                                label="Confirm"
                                variant="primary"
                                clickAction={async () => {
                                    // Update access on the server before refreshing the member list.
                                    await api.patch(`${base}/members/${member.id}`, {
                                        json: schemas.zOrganizationMemberUpdate.parse({
                                            role: member.role,
                                        }),
                                    });
                                    await invalidateDetails();
                                    setMember(null);
                                }}
                            />
                        </Stack>
                    </Stack>
                </Dialog>
            )}
        </>
    );
}

/** Owns invitation drafts and actions only while their section is active. */
function InvitationsSection({ base, canMaintain }: { base: string; canMaintain: boolean }) {
    const [invitation, setInvitation] = useState({ email: '', role: 'write' });
    const [inviting, setInviting] = useState(false);
    const reportError = useApiError();

    // Load and invalidate People data only while the invitations section is active.
    const [{ invitations }, invalidateDetails] = useApi(base, schemas.zOrganizationDetails);

    /** Sends the validated invitation and refreshes organization access. */
    async function inviteMember() {
        if (!invitation.email.trim()) return;

        // Keep the dialog open on failure, but refresh either way because a failed email still saves the invitation.
        try {
            await api.post(`${base}/invitations`, {
                json: schemas.zOrganizationInvitationCreate.parse({
                    ...invitation,
                    email: invitation.email.trim(),
                }),
            });
            setInviting(false);
        } catch (failure) {
            reportError(failure);
        } finally {
            await invalidateDetails();
        }
    }

    return (
        <>
            <Stack gap={4}>
                <Stack
                    direction="horizontal"
                    justify="between"
                    align="end"
                    wrap="wrap"
                    minHeight="var(--size-element-md)"
                >
                    <Heading level={2} hasCapsize>
                        Invitations
                    </Heading>
                    {canMaintain && <Button label="Invite" onClick={() => setInviting(true)} />}
                </Stack>
                <Divider />
                <Table
                    data={invitations}
                    idKey="id"
                    hasHover
                    density="compact"
                    columns={[
                        { key: 'email', header: 'Email', width: proportional(1) },
                        {
                            key: 'role',
                            header: 'Role',
                            width: proportional(1),
                            renderCell: (row) => <Text type="supporting">{row.role}</Text>,
                        },
                        ...(canMaintain
                            ? [
                                  {
                                      key: 'id',
                                      header: 'Actions',
                                      align: 'end' as const,
                                      width: proportional(0.5),
                                      renderCell: (row: z.output<typeof schemas.zOrganizationInvitationResponse>) => (
                                          <Button
                                              label="Revoke"
                                              variant="destructive"
                                              clickAction={async () => {
                                                  // Refresh organization access only after revocation succeeds.
                                                  await api.delete(`${base}/invitations/${row.id}`);
                                                  await invalidateDetails();
                                              }}
                                          />
                                      ),
                                  },
                              ]
                            : []),
                    ]}
                />
            </Stack>
            {/* Match organization creation with a centered form and a desktop-only illustration. */}
            <Dialog
                aria-label="Invite user"
                isOpen={inviting}
                purpose="info"
                onOpenChange={setInviting}
                width={960}
                maxHeight="calc(100dvh - var(--spacing-10) * 4)"
                padding={0}
            >
                <DialogClose onClose={() => setInviting(false)} />
                <Stack height="min(560px, calc(100dvh - var(--spacing-10) * 4))">
                    <Layout
                        padding={0}
                        end={
                            <LayoutPanel width="50%" padding={0} className="hidden bg-muted md:flex">
                                <Stack width="100%" height="100%" align="center" justify="center" padding={6}>
                                    <img
                                        src="/images/invitation.png"
                                        alt="Hand-drawn envelopes."
                                        className="h-full w-full object-contain"
                                        width={1223}
                                        height={1286}
                                        decoding="async"
                                    />
                                </Stack>
                            </LayoutPanel>
                        }
                        content={
                            <LayoutContent padding={8}>
                                <Stack
                                    height="100%"
                                    justify="center"
                                    width="max-content"
                                    maxWidth="100%"
                                    className="mx-auto"
                                >
                                    <form action={inviteMember}>
                                        <Stack gap={10}>
                                            <Stack gap={2} align="center">
                                                <img
                                                    src="/images/organization.png"
                                                    alt=""
                                                    className="size-20 object-contain"
                                                    width={1254}
                                                    height={1254}
                                                    decoding="async"
                                                />
                                                <Stack gap={0}>
                                                    <Heading level={2} justify="center">
                                                        Invite user
                                                    </Heading>
                                                    <Text as="p" color="secondary" justify="center">
                                                        Send an invitation to join this organization.
                                                    </Text>
                                                </Stack>
                                            </Stack>
                                            {/* Let the subtitle size the column, then stretch the controls to match. */}
                                            <Stack gap={4} width={0} className="min-w-full">
                                                <TextInput
                                                    label="Email"
                                                    type="email"
                                                    value={invitation.email}
                                                    placeholder="user@example.com"
                                                    isRequired
                                                    onChange={(email) => setInvitation({ ...invitation, email })}
                                                    width="100%"
                                                />
                                                <Selector
                                                    label="Role"
                                                    value={invitation.role}
                                                    options={[
                                                        { value: 'read', label: 'read', icon: EyeOff },
                                                        { value: 'write', label: 'write', icon: ArrowUp },
                                                        {
                                                            value: 'maintain',
                                                            label: 'maintain',
                                                            icon: Wrench,
                                                        },
                                                        {
                                                            value: 'admin',
                                                            label: 'admin',
                                                            icon: CheckCheck,
                                                        },
                                                    ]}
                                                    onChange={(role) => setInvitation({ ...invitation, role })}
                                                    width="100%"
                                                />
                                                <Button
                                                    label="Invite"
                                                    variant="primary"
                                                    type="submit"
                                                    width="100%"
                                                    isDisabled={!invitation.email.trim()}
                                                />
                                            </Stack>
                                        </Stack>
                                    </form>
                                </Stack>
                            </LayoutContent>
                        }
                    />
                </Stack>
            </Dialog>
        </>
    );
}

/** Shows the Free plan with independent reads for each resource's current usage. */
function BillingSection({ base }: { base: string }) {
    // Retain the settings shell's 260px navigation and fill the remaining content region with the plan card.
    return (
        <Stack gap={4}>
            <Stack justify="end" minHeight="var(--size-element-md)">
                <Heading level={2} hasCapsize>
                    Billing
                </Heading>
            </Stack>
            <Divider />
            <Card padding={0} className="overflow-hidden">
                <Stack gap={0}>
                    <Stack
                        direction="horizontal"
                        gap={3}
                        align="center"
                        paddingInline={4}
                        paddingBlock={2}
                        className="bg-muted"
                    >
                        <UserRound className="size-6 shrink-0 text-accent" aria-hidden="true" />
                        <StackItem size="fill">
                            <Stack gap={0}>
                                <Heading level={3} className="text-base" weight="medium">
                                    LongLink Free
                                </Heading>
                                <Text type="supporting">The basics for organizations</Text>
                            </Stack>
                        </StackItem>
                        <Button href="/pricing/" label="Upgrade" size="sm" variant="primary" />
                    </Stack>
                    <Divider />
                    <Stack gap={4} padding={4}>
                        {(['users', 'storage', 'database'] as const).map((resource) => (
                            <ApiBoundary
                                key={resource}
                                fallback={<Text color="secondary">Loading {resource} usage…</Text>}
                                fallbackRender={({ resetErrorBoundary }) => (
                                    <Stack direction="horizontal" align="center" justify="between" gap={4}>
                                        <Text color="secondary">
                                            {resource === 'users'
                                                ? 'User'
                                                : resource === 'storage'
                                                  ? 'Storage'
                                                  : 'Database'}{' '}
                                            usage unavailable.
                                        </Text>
                                        <Button label="Retry" onClick={resetErrorBoundary} />
                                    </Stack>
                                )}
                            >
                                {resource === 'users' ? (
                                    <UsersUsageMeter base={base} />
                                ) : (
                                    <UsageMeter base={base} resource={resource} />
                                )}
                            </ApiBoundary>
                        ))}
                    </Stack>
                </Stack>
            </Card>
            {/* Keep billing tables empty until payment records are connected. */}
            <Stack gap={3} paddingBlock={2}>
                <Heading level={3}>Connected cards</Heading>
                <Table<{ id: string; card: string; expires: string; status: string }>
                    data={[]}
                    idKey="id"
                    density="compact"
                    columns={[
                        { key: 'card', header: 'Card', width: proportional(2) },
                        { key: 'expires', header: 'Expires', width: proportional(1) },
                        { key: 'status', header: 'Status', width: proportional(1) },
                    ]}
                />
            </Stack>
            <Stack gap={3} paddingBlock={2}>
                <Heading level={3}>Invoices</Heading>
                <Table<{ id: string; date: string; amount: string; status: string }>
                    data={[]}
                    idKey="id"
                    density="compact"
                    columns={[
                        { key: 'id', header: 'Invoice', width: proportional(2) },
                        { key: 'date', header: 'Date', width: proportional(1) },
                        {
                            key: 'amount',
                            header: 'Amount',
                            align: 'end',
                            width: proportional(1),
                        },
                        { key: 'status', header: 'Status', width: proportional(1) },
                    ]}
                />
            </Stack>
        </Stack>
    );
}

/** Shows accepted members against the advertised Free plan's five-user allowance. */
function UsersUsageMeter({ base }: { base: string }) {
    // Count current members, not pending invitations, using the organization details endpoint.
    const [{ members }] = useApi(base, schemas.zOrganizationDetails);

    return (
        <ProgressBar
            label="Users"
            value={members.length}
            max={5}
            hasValueLabel
            formatValueLabel={() => `${members.length} / 5 users`}
        />
    );
}

/** Shows measured bytes against configured capacity without hiding other resource meters. */
function UsageMeter({ base, resource }: { base: string; resource: 'storage' | 'database' }) {
    const [usage] = useApi(
        `${base}/${resource}`,
        resource === 'storage' ? schemas.zOrganizationStorageUsageResponse : schemas.zOrganizationDatabaseUsageResponse
    );

    /** Formats byte counts with binary units matching the resource capacity. */
    function formatStorage(bytes: number) {
        // Keep zero explicit and preserve readable precision for small usage amounts.
        const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

        const unit = bytes === 0 ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);

        return `${(bytes / 1024 ** unit).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${units[unit]}`;
    }

    return (
        <ProgressBar
            label={resource === 'storage' ? 'File storage' : 'Database storage'}
            value={usage.space_used}
            max={usage.quota_bytes}
            hasValueLabel
            formatValueLabel={() => `${formatStorage(usage.space_used)} / ${formatStorage(usage.quota_bytes)}`}
        />
    );
}
