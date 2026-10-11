import { z } from 'zod';
import Billing from './Billing';
import { api } from '@/lib/api';
import { useState } from 'react';
import Registries from './Registries';
import { OpenAI } from '@/components/OpenAI';
import { useApi } from '@/lib/hooks/use-api';
import CreateSolution from './CreateSolution';
import { NoIndex } from '@/components/NoIndex';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@astryxdesign/core/Badge';
import { useQuery } from '@tanstack/react-query';
import { Form, FormStep } from '@/components/Form';
import { Button } from '@astryxdesign/core/Button';
import { useToast } from '@astryxdesign/core/Toast';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import { ApiBoundary } from '@/components/ApiBoundary';
import { MoreMenu } from '@astryxdesign/core/MoreMenu';
import { Selector } from '@astryxdesign/core/Selector';
import { CodeBlock } from '@astryxdesign/core/CodeBlock';
import { TextInput } from '@astryxdesign/core/TextInput';
import { DialogClose } from '@/components/ui/DialogClose';
import { SideNavItem } from '@/components/ui/SideNavItem';
import { Stack, StackItem } from '@astryxdesign/core/Stack';
import { useLocation, useOutletContext } from 'react-router';
import { Table, proportional } from '@astryxdesign/core/Table';
import { DeletionDialog } from '@/platform/components/Deletion';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import * as schemas from '@/lib/generated/platform-api-v1/zod.gen';
import { SideNav, SideNavSection } from '@astryxdesign/core/SideNav';
import { Layout, LayoutPanel, LayoutContent } from '@astryxdesign/core/Layout';
import {
    ArrowRight,
    ArrowUp,
    Boxes,
    Building2,
    CheckCheck,
    EyeOff,
    Logs,
    Plug,
    RefreshCw,
    Trash,
    Users,
    Wrench,
} from 'lucide-react';

type Solution = z.output<typeof schemas.zOrganizationSolutionSummary>;

type Update = {
    // Scope inspection and drafts to one freshly opened review attempt.
    key: string;
    item: { id: string; name: string };
};

type SolutionAction =
    | { kind: 'create' }
    | ({ kind: 'update' } & Update)
    | { kind: 'logs'; id: string }
    | { kind: 'mcp' | 'delete'; item: { id: string; name: string } };

type DeploymentReviewProps = {
    update: Update;
    invalidate: () => Promise<void>;
    onClose: () => void;
};

/** Abbreviates digest references for release comparison while preserving tag-only images. */
function imageDigest(image: string) {
    // Keep the first twelve digest characters without changing authoritative image values.
    return image.match(/@(sha256:[a-f0-9]{12})[a-f0-9]*$/)?.[1] ?? image;
}

/** Owns fresh inspection, the deployment draft, and submission for one review attempt. */
function DeploymentReview({ update, invalidate, onClose }: DeploymentReviewProps) {
    const [envs, setEnvs] = useState<Record<string, { value?: string; removed?: boolean }>>({});

    // Keep inspection attempt-local, cancel on unmount, and never refresh beneath an edited draft.
    const path = `/api/v1/solutions/${update.item.id}/update`;

    const {
        data: candidate,
        isPending,
        refetch,
    } = useQuery({
        queryKey: ['api', path, update.key],
        queryFn: ({ signal }) => api(path, { signal }).json(schemas.zSolutionUpdateCheck),
        gcTime: 0,
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    // Preserve configured required secrets, and require values for new required environments.
    const missingRequired = (candidate?.metadata.environments ?? []).some(
        (environment) =>
            environment.required &&
            (envs[environment.name]?.removed === true ||
                (!candidate?.configured_envs.includes(environment.name) && !envs[environment.name]?.value?.trim()))
    );

    const hasChanges =
        candidate?.metadata.image !== candidate?.current_image ||
        Object.values(envs).some((environment) => environment.value !== undefined || environment.removed === true);

    /** Submits the reviewed deployment while preserving untouched secrets. */
    async function updateSolution() {
        if (!candidate || missingRequired || !hasChanges) return;

        // Send edited secrets and explicit removals, preserving omitted values.
        const patchEnvs: Record<string, string | null> = {};

        // Removal takes precedence without discarding the edit retained for untoggling.
        for (const [name, environment] of Object.entries(envs)) {
            if (environment.removed === true) patchEnvs[name] = null;
            else if (environment.value !== undefined) patchEnvs[name] = environment.value;
        }

        await api.post(`/api/v1/solutions/${update.item.id}/update`, {
            json: schemas.zSolutionPatch.parse({
                envs: patchEnvs,
                expected_revision_id: candidate.revision_id,
            }),
        });
        await invalidate();
        onClose();
    }

    // Share wizard navigation while retaining revision fencing and configured-secret semantics.
    return (
        <Dialog
            aria-label={`Update ${update.item.name}`}
            isOpen
            purpose="form"
            width={960}
            maxHeight="calc(100dvh - var(--spacing-10) * 4)"
            padding={0}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogClose onClose={onClose} />
            {!candidate ? (
                <Stack height="min(560px, calc(100dvh - var(--spacing-10) * 4))">
                    <Layout
                        padding={0}
                        content={
                            <LayoutContent padding={8}>
                                <Stack gap={4} align="center" justify="center" minHeight="100%">
                                    <Heading level={2}>Update {update.item.name}</Heading>
                                    <Text as="p" role="status">
                                        {isPending ? 'Checking for updates…' : 'Could not check for updates.'}
                                    </Text>
                                    <Stack direction="horizontal" gap={2}>
                                        <Button label="Cancel" variant="ghost" onClick={onClose} />
                                        {!isPending && <Button label="Retry" onClick={() => void refetch()} />}
                                    </Stack>
                                </Stack>
                            </LayoutContent>
                        }
                    />
                </Stack>
            ) : (
                <Form
                    height="min(560px, calc(100dvh - var(--spacing-10) * 4))"
                    action={updateSolution}
                    submitLabel="Update solution"
                    submitDisabled={missingRequired || !hasChanges}
                    onCancel={onClose}
                >
                    <FormStep label="Image">
                        <Stack gap={4}>
                            <Stack gap={3} align="center">
                                <RefreshCw className="size-20 text-secondary" aria-hidden="true" />
                                <Heading level={2} justify="center">
                                    Update {update.item.name}
                                </Heading>
                            </Stack>
                            <Stack direction="horizontal" gap={4} align="center">
                                <StackItem size="fill">
                                    <Stack padding={3} className="rounded-lg bg-muted">
                                        <Text
                                            type="code"
                                            color="secondary"
                                            justify="center"
                                            display="block"
                                            className="break-all"
                                        >
                                            {candidate.current_version || imageDigest(candidate.current_image)}
                                        </Text>
                                    </Stack>
                                </StackItem>
                                <ArrowRight className="size-5 shrink-0 text-secondary" aria-hidden="true" />
                                <StackItem size="fill">
                                    <Stack padding={3} className="rounded-lg bg-muted">
                                        <Text type="code" justify="center" display="block" className="break-all">
                                            {candidate.metadata.version || imageDigest(candidate.metadata.image)}
                                        </Text>
                                    </Stack>
                                </StackItem>
                            </Stack>
                        </Stack>
                    </FormStep>
                    <FormStep label="Environment">
                        <Stack gap={4}>
                            <Stack gap={3} align="center">
                                <RefreshCw className="size-20 text-secondary" aria-hidden="true" />
                                <Heading level={2} justify="center">
                                    Configure your environment
                                </Heading>
                            </Stack>
                            {!candidate.metadata.environments?.length && (
                                <Text color="secondary">This solution does not require environment variables.</Text>
                            )}
                            {(candidate.metadata.environments ?? []).map((environment) => {
                                // Resolve the configured secret and its local draft without exposing its value.
                                const configured = candidate.configured_envs.includes(environment.name);

                                const draft = envs[environment.name];
                                const isRemoved = draft?.removed === true;

                                // Configured secrets remain hidden; blank untouched inputs preserve them.
                                return (
                                    <Stack key={environment.name} gap={2}>
                                        <TextInput
                                            label={environment.name}
                                            labelTooltip={environment.description ?? undefined}
                                            type="password"
                                            value={draft?.value ?? ''}
                                            isDisabled={isRemoved}
                                            isOptional={!environment.required}
                                            isRequired={environment.required && (!configured || isRemoved)}
                                            placeholder={
                                                isRemoved
                                                    ? 'Will be removed'
                                                    : configured
                                                      ? 'Configured: preserve existing value'
                                                      : environment.description || 'Enter value'
                                            }
                                            onChange={(value) =>
                                                setEnvs((current) => ({
                                                    ...current,
                                                    [environment.name]: {
                                                        ...current[environment.name],
                                                        value,
                                                    },
                                                }))
                                            }
                                        />
                                        {configured && !environment.required && (
                                            <CheckboxInput
                                                label={`Remove ${environment.name}`}
                                                value={isRemoved}
                                                onChange={(removed) =>
                                                    setEnvs((current) => ({
                                                        ...current,
                                                        [environment.name]: {
                                                            ...current[environment.name],
                                                            removed,
                                                        },
                                                    }))
                                                }
                                            />
                                        )}
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </FormStep>
                </Form>
            )}
        </Dialog>
    );
}

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
                        <ApiBoundary key="billing">
                            <Billing base={base} canManage={membership.role === 'owner'} />
                        </ApiBoundary>
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
                            <SolutionsSection organization={membership.organization} canMaintain={canMaintain} />
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

/** Owns role-change and seat-removal confirmations only while the members section is active. */
function MembersSection({ base, canAdminister }: { base: string; canAdminister: boolean }) {
    const [member, setMember] = useState<{
        id: string;
        name: string;
        action: { kind: 'role'; role: string } | { kind: 'remove' };
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
                                            <Badge label={row.role} />
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
                                              items={[
                                                  ...['read', 'write', 'maintain', 'admin'].flatMap((role) =>
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
                                                                            action: { kind: 'role', role },
                                                                        }),
                                                                },
                                                            ]
                                                  ),
                                                  {
                                                      id: 'remove',
                                                      label: 'Remove member',
                                                      onClick: () =>
                                                          setMember({
                                                              id: row.user.id,
                                                              name: row.user.name,
                                                              action: { kind: 'remove' },
                                                          }),
                                                  },
                                              ]}
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
                    <DialogHeader
                        title={member.action.kind === 'remove' ? 'Remove member' : 'Change role'}
                        onOpenChange={() => setMember(null)}
                    />
                    <Stack gap={3}>
                        <Text color="secondary">
                            {member.action.kind === 'remove'
                                ? `Remove ${member.name} from this organization? Access is revoked immediately and the next renewal uses the reduced seat count.`
                                : `Change ${member.name} to ${member.action.role}?`}
                        </Text>
                        <Stack direction="horizontal" gap={2} justify="end">
                            <Button label="Cancel" variant="ghost" onClick={() => setMember(null)} />
                            <Button
                                label={member.action.kind === 'remove' ? 'Remove member' : 'Confirm'}
                                variant={member.action.kind === 'remove' ? 'destructive' : 'primary'}
                                clickAction={async () => {
                                    // Update access on the server before refreshing the member list.
                                    if (member.action.kind === 'remove') {
                                        await api.delete(`${base}/members/${member.id}`);
                                    } else {
                                        await api.patch(`${base}/members/${member.id}`, {
                                            json: schemas.zOrganizationMemberUpdate.parse({ role: member.action.role }),
                                        });
                                    }

                                    // Refresh members only after the confirmed access change succeeds.
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

    // Load and invalidate People data only while the invitations section is active.
    const [{ invitations }, invalidateDetails] = useApi(base, schemas.zOrganizationDetails);

    /** Sends the validated invitation and refreshes organization access. */
    async function inviteMember() {
        if (!invitation.email.trim()) return;

        // Refresh organization access only after sending the invitation succeeds.
        await api.post(`${base}/invitations`, {
            json: schemas.zOrganizationInvitationCreate.parse({
                ...invitation,
                email: invitation.email.trim(),
            }),
        });
        await invalidateDetails();
        setInviting(false);
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
                            renderCell: (row) => <Badge label={row.role} />,
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

/** Owns solution reads and dialogs for the lifetime of the active section. */
function SolutionsSection({
    organization,
    canMaintain,
}: {
    organization: z.output<typeof schemas.zUserOrganizationMembership>['organization'];
    canMaintain: boolean;
}) {
    // Own one dialog action; captured identity prevents old completions from closing its replacement.
    const [selected, setSelected] = useState<SolutionAction | null>(null);
    const base = `/api/v1/organizations/${organization.id}`;

    // Keep solution refreshes scoped to the section's resource.
    const [solutions, invalidateSolutions] = useApi(`${base}/solutions`, schemas.zOrganizationSolutionSummary.array());

    /** Closes only this selection, leaving a replacement dialog open after an older operation finishes. */
    function closeSelected() {
        // Each render captures the selection that owns its callbacks.
        setSelected((current) => (current === selected ? null : current));
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
                        Solutions
                    </Heading>
                    {canMaintain && (
                        <Button
                            label="New Solution"
                            onClick={() =>
                                setSelected((current) => (current?.kind === 'create' ? current : { kind: 'create' }))
                            }
                        />
                    )}
                </Stack>
                <Divider />
                <Table
                    data={solutions}
                    idKey="id"
                    hasHover
                    density="compact"
                    columns={[
                        {
                            key: 'name',
                            header: 'Solution',
                            width: proportional(1),
                            renderCell: (row) => (
                                <Stack>
                                    <Link href={`/orgs/${organization.slug}/solutions/${row.slug}`}>{row.name}</Link>
                                    {row.description && <Text type="supporting">{row.description}</Text>}
                                </Stack>
                            ),
                        },
                        ...(canMaintain
                            ? [
                                  {
                                      key: 'id',
                                      header: 'Actions',
                                      align: 'end' as const,
                                      width: proportional(0.5),
                                      renderCell: (row: Solution) => (
                                          <MoreMenu
                                              alignment="end"
                                              size="sm"
                                              items={[
                                                  ...(row.desired_revision_id &&
                                                  !row.deployment_pending &&
                                                  row.status !== 'creating'
                                                      ? [
                                                            {
                                                                id: 'update',
                                                                label: 'Update',
                                                                icon: (
                                                                    <RefreshCw className="size-4" aria-hidden="true" />
                                                                ),
                                                                onClick: () => {
                                                                    // Retain an active attempt so repeated activation cannot replace its draft.
                                                                    setSelected((current) =>
                                                                        current?.kind === 'update'
                                                                            ? current
                                                                            : {
                                                                                  kind: 'update',
                                                                                  key: crypto.randomUUID(),
                                                                                  item: {
                                                                                      id: row.id,
                                                                                      name: row.name,
                                                                                  },
                                                                              }
                                                                    );
                                                                },
                                                            },
                                                        ]
                                                      : []),
                                                  {
                                                      id: 'logs',
                                                      label: 'Logs',
                                                      icon: <Logs className="size-4" aria-hidden="true" />,
                                                      onClick: () => setSelected({ kind: 'logs', id: row.id }),
                                                  },
                                                  {
                                                      id: 'mcp',
                                                      label: 'MCP',
                                                      icon: <Plug className="size-4" aria-hidden="true" />,
                                                      onClick: () =>
                                                          setSelected({
                                                              kind: 'mcp',
                                                              item: { id: row.id, name: row.name },
                                                          }),
                                                  },
                                                  {
                                                      id: 'delete',
                                                      label: 'Delete',
                                                      icon: <Trash className="size-4" aria-hidden="true" />,
                                                      onClick: () =>
                                                          setSelected({
                                                              kind: 'delete',
                                                              item: { id: row.id, name: row.name },
                                                          }),
                                                  },
                                              ]}
                                          />
                                      ),
                                  },
                              ]
                            : []),
                    ]}
                />
            </Stack>
            {selected?.kind === 'create' && (
                <CreateSolution
                    organizationId={organization.id}
                    invalidate={invalidateSolutions}
                    onClose={closeSelected}
                />
            )}
            {selected?.kind === 'update' && (
                <DeploymentReview
                    key={selected.key}
                    update={selected}
                    invalidate={invalidateSolutions}
                    onClose={closeSelected}
                />
            )}
            {selected?.kind === 'logs' && (
                <Dialog
                    aria-label="Pod logs"
                    isOpen
                    purpose="info"
                    width={960}
                    maxHeight="calc(100dvh - var(--spacing-10) * 4)"
                    padding={0}
                    onOpenChange={(open) => {
                        if (!open) closeSelected();
                    }}
                >
                    <DialogClose onClose={closeSelected} />
                    <Stack height="min(560px, calc(100dvh - var(--spacing-10) * 4))" paddingInline={8} paddingBlock={4}>
                        <ApiBoundary key={selected.id}>
                            <SolutionLogs solutionId={selected.id} onClose={closeSelected} />
                        </ApiBoundary>
                    </Stack>
                </Dialog>
            )}
            {/* Offer direct MCP connection details and the selected Solution's credential-free package. */}
            {selected?.kind === 'mcp' && (
                <Dialog
                    aria-label="Model Context Protocol"
                    isOpen
                    purpose="info"
                    width={960}
                    maxHeight="calc(100dvh - var(--spacing-10) * 4)"
                    padding={0}
                    onOpenChange={(open) => {
                        if (!open) closeSelected();
                    }}
                >
                    <DialogClose onClose={closeSelected} />
                    <Stack height="min(560px, calc(100dvh - var(--spacing-10) * 4))">
                        <Layout
                            padding={0}
                            end={
                                <LayoutPanel width="50%" padding={0} className="hidden bg-muted md:flex">
                                    <Stack width="100%" height="100%" align="center" justify="center" padding={6}>
                                        <img
                                            src="/images/mcp.png"
                                            alt="Hand-drawn globe surrounded by orbiting spheres."
                                            className="h-full w-full object-contain"
                                            width={941}
                                            height={1672}
                                            decoding="async"
                                        />
                                    </Stack>
                                </LayoutPanel>
                            }
                            content={
                                <LayoutContent padding={8} isScrollable>
                                    <Stack
                                        minHeight="100%"
                                        justify="center"
                                        width="max-content"
                                        maxWidth="100%"
                                        gap={6}
                                        className="mx-auto"
                                    >
                                        <Stack gap={2} align="center">
                                            <Plug className="size-20 text-secondary" aria-hidden="true" />
                                            <Stack gap={0}>
                                                <Heading level={2} justify="center">
                                                    Model Context Protocol
                                                </Heading>
                                                <Text as="p" color="secondary" justify="center">
                                                    Connect your solution to AI tools
                                                </Text>
                                            </Stack>
                                        </Stack>
                                        {/* Match the creation dialog's content-sized column and control width. */}
                                        <Stack gap={4} width={0} className="min-w-full">
                                            <ApiBoundary key={selected.item.id}>
                                                <SolutionMcpUrl solutionId={selected.item.id} onClose={closeSelected} />
                                            </ApiBoundary>
                                            <Button
                                                as="a"
                                                href={`/api/v1/solutions/${selected.item.id}/plugin`}
                                                label="Download plugin ZIP"
                                                variant="primary"
                                                width="100%"
                                                icon={
                                                    <OpenAI
                                                        className="size-5 scale-125"
                                                        aria-hidden="true"
                                                        focusable="false"
                                                    />
                                                }
                                            />
                                        </Stack>
                                    </Stack>
                                </LayoutContent>
                            }
                        />
                    </Stack>
                </Dialog>
            )}
            <DeletionDialog
                confirmation={
                    selected?.kind === 'delete'
                        ? {
                              title: 'Delete solution',
                              description: `Delete solution ${selected.item.name}?`,
                              onDelete: async () => {
                                  // Refresh Solutions only after the delete request succeeds.
                                  await api.delete(`/api/v1/solutions/${selected.item.id}`);
                                  await invalidateSolutions();
                                  closeSelected();
                              },
                          }
                        : null
                }
                onClose={closeSelected}
            />
        </>
    );
}

/** Reads the canonical public connection URL without guessing the deployment's origin. */
function SolutionMcpUrl({ solutionId, onClose }: { solutionId: string; onClose: () => void }) {
    const showToast = useToast();

    // Reuse OAuth discovery so the copied URL matches the plugin's configured public address.
    const [{ resource }] = useApi(
        `/.well-known/oauth-protected-resource/api/v1/solutions/${solutionId}/proxy/mcp`,
        schemas.zResourceMetadata
    );

    return (
        <Button
            label="Copy MCP server URL"
            width="100%"
            clickAction={async () => {
                // Copy only the canonical connection URL, without credentials.
                await navigator.clipboard.writeText(resource);

                // Confirm a successful copy and dismiss the MCP dialog.
                showToast({ body: 'Copied' });
                onClose();
            }}
        />
    );
}

/** Loads pod logs only while their dialog is open. */
function SolutionLogs({ solutionId, onClose }: { solutionId: string; onClose: () => void }) {
    const [logs, invalidate] = useApi(`/api/v1/solutions/${solutionId}/logs`, z.array(z.string()));

    // Keep log scrolling inside CodeBlock while dismissal and refresh remain visible.
    return (
        <Stack gap={3} height="100%">
            <StackItem size="fill">
                <CodeBlock
                    code={logs.join('\n')}
                    hasLineNumbers
                    isWrapped
                    size="sm"
                    width="100%"
                    maxHeight="100%"
                    className="h-full"
                />
            </StackItem>
            <Stack direction="horizontal" gap={2} justify="between" wrap="wrap">
                <Button label="Close" variant="ghost" onClick={onClose} />
                <Button
                    label="Refresh logs"
                    variant="secondary"
                    icon={<RefreshCw className="size-4" aria-hidden="true" />}
                    clickAction={invalidate}
                />
            </Stack>
        </Stack>
    );
}
