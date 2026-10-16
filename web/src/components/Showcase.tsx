import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Switch } from '@/components/ui/Switch';
import { Wordmark } from '@/components/Wordmark';
import { Badge } from '@astryxdesign/core/Badge';
import { Stack } from '@astryxdesign/core/Stack';
import { Selector } from '@/components/ui/Selector';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import { Section } from '@astryxdesign/core/Section';
import { TextInput } from '@/components/ui/TextInput';
import { Thumbnail } from '@astryxdesign/core/Thumbnail';
import { NumberInput } from '@/components/ui/NumberInput';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Circle, FileText, Settings } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';
import { Step, Stepper } from '@astryxdesign/core/Stepper';
import { PlatformFrame } from '@/components/layouts/Platform';
import { Table, proportional } from '@astryxdesign/core/Table';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { BreadcrumbItem, Breadcrumbs } from '@astryxdesign/core/Breadcrumbs';
import { Layout, LayoutContent, LayoutPanel } from '@astryxdesign/core/Layout';
import { Menu, MenuItem, MenuSection, MenuNavigationContext } from '@/components/ui/Menu';

// Mirror the sample Solution's tabs without organization navigation or account data.
const showcaseTabs = [
    { id: 'cards', label: 'Projects', description: 'This can be used for tracking projects in a gallery.' },
    { id: 'table', label: 'Table', description: 'This can be used for reviewing projects in a table.' },
    { id: 'menu', label: 'Settings', description: 'This can be used for organizing settings into navigable sections.' },
] as const;

// Share four local projects between the gallery and table without requesting Solution data.
const projects = [
    {
        id: 1,
        name: 'Riverside Residences',
        description: 'Modern riverside apartments.',
        status: 'Planning',
        owner: 'Anna Keller',
        ownerEmail: 'anna.keller@example.com',
        photo: 'riverside',
        activeStep: 0,
    },
    {
        id: 2,
        name: 'Skyline Tower',
        description: 'A new landmark for the city.',
        status: 'In progress',
        owner: 'Marco Rossi',
        ownerEmail: 'marco.rossi@example.com',
        photo: 'skyline',
        activeStep: 4,
    },
    {
        id: 3,
        name: 'Garden Apartments',
        description: 'Light-filled homes with green spaces.',
        status: 'Completed',
        owner: 'Anna Keller',
        ownerEmail: 'anna.keller@example.com',
        photo: 'garden',
        activeStep: 5,
    },
    {
        id: 4,
        name: 'Harbor Offices',
        description: 'Contemporary waterfront workspaces.',
        status: 'In progress',
        owner: 'Marco Rossi',
        ownerEmail: 'marco.rossi@example.com',
        photo: 'harbor',
        activeStep: 2,
    },
];

// Use the same construction lifecycle for every building project, with project-specific progress.
const projectSteps = [
    {
        label: 'Strategic planning',
        description: 'Define what you want to build, the budget, and your objectives.',
        documents: [
            { name: 'Client brief', available: true },
            { name: 'Room schedule', available: true },
            { name: 'Financial budget', available: false },
            { name: 'Preliminary schedule', available: false },
        ],
    },
    {
        label: 'Preliminary studies',
        description: 'Check the feasibility and select the project team.',
        documents: [
            { name: 'Site and zoning assessment', available: true },
            { name: 'Feasibility study', available: true },
            { name: 'Preliminary costs', available: false },
            { name: 'Architect and engineer contracts', available: false },
        ],
    },
    {
        label: 'Project design',
        description: 'Design the house and obtain planning permission.',
        documents: [
            { name: 'Architectural plans', available: true },
            { name: 'Engineering concepts', available: true },
            { name: 'Building description', available: true },
            { name: 'Detailed cost estimate', available: false },
            { name: 'Permit application and approvals', available: false },
        ],
    },
    {
        label: 'Tendering',
        description: 'Request quotations, compare contractors, and award contracts.',
        documents: [
            { name: 'Tender drawings', available: true },
            { name: 'Bills of quantities', available: true },
            { name: 'Specifications', available: true },
            { name: 'Contractor bids', available: false },
            { name: 'Comparison', available: false },
            { name: 'Construction contracts', available: false },
        ],
    },
    {
        label: 'Realization',
        description: 'Prepare construction drawings, build, inspect, and hand over the house.',
        documents: [
            { name: 'Execution drawings', available: true },
            { name: 'Construction and inspection records', available: true },
            { name: 'Acceptance protocol', available: false },
            { name: 'As-built documentation', available: false },
            { name: 'Commissioning records', available: false },
            { name: 'Final account', available: false },
        ],
    },
    {
        label: 'Operation and maintenance',
        description: 'Operate, inspect, maintain, and repair the completed property.',
        documents: [
            { name: 'Building manual', available: true },
            { name: 'Warranties', available: true },
            { name: 'Inspection and service plans', available: true },
            { name: 'Maintenance records', available: false },
            { name: 'Repair documentation', available: false },
        ],
    },
];

/** Shows project views in one local-only, tabbed homepage preview. */
export function Showcase() {
    // Retain settings when switching between the sample views.
    const [tab, setTab] = useState('cards');
    const [projectId, setProjectId] = useState<number | null>(null);
    const [phaseIndex, setPhaseIndex] = useState<number | null>(null);
    const [menuHash, setMenuHash] = useState('');
    const [company, setCompany] = useState('Acme Ink');
    const [currency, setCurrency] = useState('CHF');
    const [approvalRequired, setApprovalRequired] = useState(true);
    const [approvalThreshold, setApprovalThreshold] = useState(1000);
    const [pendingNotifications, setPendingNotifications] = useState(true);
    const [approvedNotifications, setApprovedNotifications] = useState(false);

    // Resolve the visible tab and optional record details from their stable identifiers.
    const activeTab = showcaseTabs.find((item) => item.id === tab) ?? showcaseTabs[0];
    const activeProject = projects.find((project) => project.id === projectId);
    const activePhase = phaseIndex === null ? undefined : projectSteps[phaseIndex];

    // Keep the preview window's size while scaling its contents to 80%.
    return (
        <Section
            className="hidden sm:block"
            paddingInline={6}
            paddingBlockEnd={10}
            variant="transparent"
            aria-label="Example Showcase"
        >
            <Section
                padding={0}
                width="100%"
                maxWidth={1000}
                height="clamp(420px, 62.5vw, 625px)"
                className="mx-auto my-0 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-lg"
            >
                <Layout
                    height="fill"
                    padding={0}
                    header={
                        <Stack
                            direction="horizontal"
                            gap={1.5}
                            align="center"
                            paddingInline={3}
                            aria-hidden="true"
                            className="h-6 shrink-0 border-b border-border bg-muted"
                        >
                            <Icon
                                icon={Circle}
                                size="xsm"
                                className="fill-(--color-window-close) stroke-(--color-window-close)"
                            />
                            <Icon
                                icon={Circle}
                                size="xsm"
                                className="fill-(--color-window-minimize) stroke-(--color-window-minimize)"
                            />
                            <Icon
                                icon={Circle}
                                size="xsm"
                                className="fill-(--color-window-maximize) stroke-(--color-window-maximize)"
                            />
                        </Stack>
                    }
                    content={
                        <LayoutContent
                            padding={0}
                            isScrollable={false}
                            role="region"
                            label="Interactive project showcase"
                        >
                            <PlatformFrame
                                height="fill"
                                className="h-full zoom-80"
                                breadcrumb={
                                    <Breadcrumbs separator=">" variant="supporting" label="Showcase breadcrumb">
                                        <BreadcrumbItem
                                            href="#showcase-cards"
                                            onClick={(event) => {
                                                // Return to the showcase's first tab without leaving the homepage.
                                                event.preventDefault();
                                                setTab('cards');
                                                setProjectId(null);
                                                setPhaseIndex(null);
                                            }}
                                        >
                                            <Wordmark />
                                        </BreadcrumbItem>
                                        <BreadcrumbItem
                                            href={activeProject ? `#showcase-${activeTab.id}` : undefined}
                                            isCurrent={!activeProject}
                                            onClick={(event) => {
                                                // Return from record details to the current showcase tab.
                                                event.preventDefault();
                                                setProjectId(null);
                                                setPhaseIndex(null);
                                            }}
                                        >
                                            Example Showcase
                                        </BreadcrumbItem>
                                        {activeProject && (
                                            <BreadcrumbItem
                                                href={activePhase ? `#showcase-project-${activeProject.id}` : undefined}
                                                isCurrent={!activePhase}
                                                onClick={(event) => {
                                                    // Return from a phase subview to this project's construction steps.
                                                    event.preventDefault();
                                                    setPhaseIndex(null);
                                                }}
                                            >
                                                {activeProject.name}
                                            </BreadcrumbItem>
                                        )}
                                        {activePhase && <BreadcrumbItem isCurrent>{activePhase.label}</BreadcrumbItem>}
                                    </Breadcrumbs>
                                }
                                action={<Avatar name="Example user" src="/favicon.svg?v=2" />}
                                navigation={
                                    <TabList
                                        value={activeTab.id}
                                        onChange={(value) => {
                                            // Open each tab at its main view without discarding local edits.
                                            setTab(value);
                                            setProjectId(null);
                                            setPhaseIndex(null);
                                        }}
                                        role="tablist"
                                        aria-label="Example Showcase views"
                                        className="relative z-20"
                                        size="sm"
                                    >
                                        {showcaseTabs.map((item) => (
                                            <Tab
                                                key={item.id}
                                                value={item.id}
                                                label={item.label}
                                                panelId={`showcase-${item.id}`}
                                                icon={
                                                    item.id === 'menu' ? (
                                                        <Settings aria-hidden="true" size={16} />
                                                    ) : (
                                                        <FileText aria-hidden="true" size={16} />
                                                    )
                                                }
                                            />
                                        ))}
                                    </TabList>
                                }
                            >
                                <PageContainer minHeight="100%" paddingBlock={2} className="px-8 md:px-16">
                                    <Stack
                                        id={`showcase-${activeTab.id}`}
                                        role="tabpanel"
                                        aria-label={activeTab.label}
                                        tabIndex={0}
                                        gap={4}
                                    >
                                        {activeProject ? (
                                            <Stack gap={4}>
                                                {activePhase ? (
                                                    <Stack gap={0}>
                                                        <Heading level={2}>{activePhase.label}</Heading>
                                                        <Text type="supporting">{activePhase.description}</Text>
                                                    </Stack>
                                                ) : (
                                                    <Stack direction="horizontal" align="center" gap={2}>
                                                        <Thumbnail
                                                            src={`/images/showcase/${activeProject.photo}.jpg`}
                                                            alt={`${activeProject.name} building`}
                                                            label={activeProject.name}
                                                            className="w-10!"
                                                        />
                                                        <Stack gap={0}>
                                                            <Heading level={2}>{activeProject.name}</Heading>
                                                            <Text type="supporting">{activeProject.description}</Text>
                                                        </Stack>
                                                    </Stack>
                                                )}
                                                <Divider />
                                                <Layout
                                                    height="auto"
                                                    padding={0}
                                                    content={
                                                        <LayoutContent isScrollable={false}>
                                                            <Stack paddingInlineEnd={8}>
                                                                {activePhase ? (
                                                                    <Table
                                                                        data={activePhase.documents}
                                                                        idKey="name"
                                                                        density="compact"
                                                                        verticalAlign="top"
                                                                        columns={[
                                                                            {
                                                                                key: 'name',
                                                                                header: 'Document',
                                                                                width: proportional(1),
                                                                                renderCell: (document) => (
                                                                                    <CheckboxInput
                                                                                        label={document.name}
                                                                                        size="sm"
                                                                                        value={document.available}
                                                                                        isReadOnly
                                                                                    />
                                                                                ),
                                                                            },
                                                                        ]}
                                                                    />
                                                                ) : (
                                                                    <Stepper
                                                                        activeStep={activeProject.activeStep}
                                                                        onStepClick={setPhaseIndex}
                                                                        orientation="vertical"
                                                                        density="compact"
                                                                        label={`${activeProject.name} construction phases`}
                                                                    >
                                                                        {projectSteps.map((step, index) => (
                                                                            <Step
                                                                                key={step.label}
                                                                                step={index}
                                                                                label={step.label}
                                                                                description={step.description}
                                                                                indicator={String(index + 1).padStart(
                                                                                    2,
                                                                                    '0'
                                                                                )}
                                                                            />
                                                                        ))}
                                                                    </Stepper>
                                                                )}
                                                            </Stack>
                                                        </LayoutContent>
                                                    }
                                                    end={
                                                        <LayoutPanel
                                                            width="30%"
                                                            isScrollable={false}
                                                            role="complementary"
                                                            label="Project details"
                                                        >
                                                            <Stack gap={2}>
                                                                <Badge label={activeProject.status} />
                                                                <Stack gap={2}>
                                                                    <Text type="supporting">Project owner</Text>
                                                                    <Stack
                                                                        direction="horizontal"
                                                                        align="center"
                                                                        gap={2}
                                                                    >
                                                                        <Avatar name={activeProject.owner} size="sm" />
                                                                        <Stack gap={0}>
                                                                            <Text>{activeProject.owner}</Text>
                                                                            <Text type="supporting">
                                                                                {activeProject.ownerEmail}
                                                                            </Text>
                                                                        </Stack>
                                                                    </Stack>
                                                                </Stack>
                                                            </Stack>
                                                        </LayoutPanel>
                                                    }
                                                />
                                            </Stack>
                                        ) : (
                                            <>
                                                <Stack gap={0}>
                                                    <Heading level={2}>
                                                        {activeTab.id === 'cards'
                                                            ? 'Projects'
                                                            : `Example ${activeTab.label} View`}
                                                    </Heading>
                                                    <Text color="secondary">{activeTab.description}</Text>
                                                </Stack>
                                                {activeTab.id === 'cards' && (
                                                    <Grid columns={4} gap={2} align="stretch">
                                                        {projects.map((project) => (
                                                            <Card
                                                                key={project.id}
                                                                label={project.name}
                                                                variant="muted"
                                                                padding={0}
                                                                height="100%"
                                                                isClipped
                                                                onClick={() => {
                                                                    // Open the project's overview rather than a previously selected phase.
                                                                    setProjectId(project.id);
                                                                    setPhaseIndex(null);
                                                                }}
                                                            >
                                                                <Stack gap={0} height="100%">
                                                                    <Thumbnail
                                                                        src={`/images/showcase/${project.photo}.jpg`}
                                                                        alt={`${project.name} building`}
                                                                        className="w-full! [&>div]:aspect-video! [&>div]:rounded-none!"
                                                                    />
                                                                    <Stack gap={4} padding={3} className="flex-1">
                                                                        <Stack gap={0} hAlign="start">
                                                                            <Heading level={3} maxLines={1}>
                                                                                {project.name}
                                                                            </Heading>
                                                                            <Badge
                                                                                label={project.status}
                                                                                variant={
                                                                                    project.status === 'Completed'
                                                                                        ? 'success'
                                                                                        : project.status ===
                                                                                            'In progress'
                                                                                          ? 'warning'
                                                                                          : 'neutral'
                                                                                }
                                                                            />
                                                                        </Stack>
                                                                        <Text
                                                                            type="supporting"
                                                                            maxLines={2}
                                                                            className="mt-auto"
                                                                        >
                                                                            {project.description}
                                                                        </Text>
                                                                    </Stack>
                                                                </Stack>
                                                            </Card>
                                                        ))}
                                                    </Grid>
                                                )}
                                                {activeTab.id === 'menu' && (
                                                    <MenuNavigationContext
                                                        value={{
                                                            hash: menuHash,
                                                            select: (id) => setMenuHash(`#${id}`),
                                                        }}
                                                    >
                                                        <Menu>
                                                            <MenuSection title="Invoices">
                                                                <MenuItem label="General">
                                                                    <Stack gap={4} maxWidth={640}>
                                                                        <Heading level={3}>General</Heading>
                                                                        <TextInput
                                                                            label="Company name"
                                                                            value={company}
                                                                            onChange={setCompany}
                                                                        />
                                                                        <Selector
                                                                            label="Default currency"
                                                                            value={currency}
                                                                            onChange={setCurrency}
                                                                            options={['CHF', 'EUR', 'USD']}
                                                                        />
                                                                    </Stack>
                                                                </MenuItem>
                                                                <MenuItem label="Approvals">
                                                                    <Stack gap={4} maxWidth={640}>
                                                                        <Heading level={3}>Approvals</Heading>
                                                                        <Switch
                                                                            label="Require invoice approval"
                                                                            value={approvalRequired}
                                                                            onChange={setApprovalRequired}
                                                                        />
                                                                        <NumberInput
                                                                            label={`Approval threshold (${currency})`}
                                                                            value={approvalThreshold}
                                                                            onChange={setApprovalThreshold}
                                                                            min={0}
                                                                            disabled={!approvalRequired}
                                                                        />
                                                                    </Stack>
                                                                </MenuItem>
                                                                <MenuItem label="Notifications">
                                                                    <Stack gap={4} maxWidth={640}>
                                                                        <Heading level={3}>Notifications</Heading>
                                                                        <Switch
                                                                            label="Invoice awaiting approval"
                                                                            value={pendingNotifications}
                                                                            onChange={setPendingNotifications}
                                                                        />
                                                                        <Switch
                                                                            label="Invoice approved"
                                                                            value={approvedNotifications}
                                                                            onChange={setApprovedNotifications}
                                                                        />
                                                                    </Stack>
                                                                </MenuItem>
                                                            </MenuSection>
                                                        </Menu>
                                                    </MenuNavigationContext>
                                                )}
                                                {activeTab.id === 'table' && (
                                                    <Table
                                                        data={projects}
                                                        idKey="id"
                                                        density="compact"
                                                        hasHover
                                                        columns={[
                                                            {
                                                                key: 'name',
                                                                header: 'Project',
                                                                width: proportional(2),
                                                                renderCell: (project) => (
                                                                    <Stack
                                                                        direction="horizontal"
                                                                        align="center"
                                                                        gap={2}
                                                                    >
                                                                        <Thumbnail
                                                                            src={`/images/showcase/${project.photo}.jpg`}
                                                                            alt={`${project.name} building`}
                                                                            label={project.name}
                                                                            className="w-8!"
                                                                        />
                                                                        <Stack gap={0}>
                                                                            <Stack
                                                                                direction="horizontal"
                                                                                align="center"
                                                                                gap={2}
                                                                                wrap="wrap"
                                                                            >
                                                                                <Link
                                                                                    href={`#showcase-project-${project.id}`}
                                                                                    onClick={(event) => {
                                                                                        // Open the same project detail as the gallery without leaving the homepage.
                                                                                        event.preventDefault();
                                                                                        setProjectId(project.id);
                                                                                        setPhaseIndex(null);
                                                                                    }}
                                                                                >
                                                                                    {project.name}
                                                                                </Link>
                                                                                <Badge
                                                                                    label={project.status}
                                                                                    variant={
                                                                                        project.status === 'Completed'
                                                                                            ? 'success'
                                                                                            : project.status ===
                                                                                                'In progress'
                                                                                              ? 'warning'
                                                                                              : 'neutral'
                                                                                    }
                                                                                />
                                                                            </Stack>
                                                                            <Text type="supporting">
                                                                                {project.description}
                                                                            </Text>
                                                                        </Stack>
                                                                    </Stack>
                                                                ),
                                                            },
                                                            {
                                                                key: 'owner',
                                                                header: 'Project owner',
                                                                width: proportional(2),
                                                                renderCell: (project) => (
                                                                    <Stack
                                                                        direction="horizontal"
                                                                        align="center"
                                                                        gap={2}
                                                                    >
                                                                        <Avatar name={project.owner} size="sm" />
                                                                        <Stack gap={0}>
                                                                            <Text>{project.owner}</Text>
                                                                            <Text type="supporting">
                                                                                {project.ownerEmail}
                                                                            </Text>
                                                                        </Stack>
                                                                    </Stack>
                                                                ),
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </Stack>
                                </PageContainer>
                            </PlatformFrame>
                        </LayoutContent>
                    }
                />
            </Section>
        </Section>
    );
}
