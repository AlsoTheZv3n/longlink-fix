import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Switch } from '@/components/ui/Switch';
import { Circle, FileText } from 'lucide-react';
import { Wordmark } from '@/components/Wordmark';
import { Badge } from '@astryxdesign/core/Badge';
import { Stack } from '@astryxdesign/core/Stack';
import { Button } from '@astryxdesign/core/Button';
import { Currency } from '@/components/ui/Currency';
import { Selector } from '@/components/ui/Selector';
import { Heading } from '@astryxdesign/core/Heading';
import { Section } from '@astryxdesign/core/Section';
import { TextInput } from '@/components/ui/TextInput';
import { Timestamp } from '@/components/ui/Timestamp';
import { NumberInput } from '@/components/ui/NumberInput';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { PageContainer } from '@/components/PageContainer';
import { Step, Stepper } from '@astryxdesign/core/Stepper';
import { PlatformFrame } from '@/components/layouts/Platform';
import { Table, proportional } from '@astryxdesign/core/Table';
import { Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { BreadcrumbItem, Breadcrumbs } from '@astryxdesign/core/Breadcrumbs';
import { Menu, MenuItem, MenuSection, MenuNavigationContext } from '@/components/ui/Menu';

type Invoice = {
    id: number;
    name: string;
    price: number;
    status: 'draft' | 'pending' | 'approved';
    createdAt: string;
    createdBy: string;
};

// Mirror the sample Solution's tabs without organization navigation or account data.
const showcaseTabs = [
    { id: 'cards', label: 'Cards', description: 'This can be used for comparing invoices in a gallery.' },
    { id: 'menu', label: 'Menu', description: 'This can be used for organizing settings into navigable sections.' },
    {
        id: 'steps',
        label: 'Steps',
        description: 'This can be used for opening invoices through a sequence of steps.',
    },
    { id: 'table', label: 'Table', description: 'This can be used for reviewing invoices and managing approvals.' },
] as const;

// Keep demo invoices local so homepage interactions never read or change Solution data.
const sampleInvoices: Invoice[] = [
    {
        id: 1,
        name: 'INV-2026-001',
        price: 1250,
        status: 'draft',
        createdAt: '2026-10-08T09:30:00Z',
        createdBy: 'Anna Keller',
    },
    {
        id: 2,
        name: 'INV-2026-002',
        price: 840,
        status: 'pending',
        createdAt: '2026-10-09T11:00:00Z',
        createdBy: 'Marco Rossi',
    },
    {
        id: 3,
        name: 'INV-2026-003',
        price: 3200,
        status: 'approved',
        createdAt: '2026-10-10T10:15:00Z',
        createdBy: 'Anna Keller',
    },
    {
        id: 4,
        name: 'INV-2026-004',
        price: 560,
        status: 'pending',
        createdAt: '2026-10-11T08:45:00Z',
        createdBy: 'Marco Rossi',
    },
];

/** Shows the sample's invoice views in one local-only, tabbed homepage preview. */
export function Showcase() {
    // Retain invoice edits and settings when switching between the sample views.
    const [tab, setTab] = useState('cards');
    const [invoices, setInvoices] = useState(sampleInvoices);
    const [invoiceId, setInvoiceId] = useState<number | null>(null);
    const [menuHash, setMenuHash] = useState('');
    const [company, setCompany] = useState('Acme Ink');
    const [currency, setCurrency] = useState('CHF');
    const [approvalRequired, setApprovalRequired] = useState(true);
    const [approvalThreshold, setApprovalThreshold] = useState(1000);
    const [pendingNotifications, setPendingNotifications] = useState(true);
    const [approvedNotifications, setApprovedNotifications] = useState(false);

    // Resolve the visible tab and optional invoice detail from their stable identifiers.
    const activeTab = showcaseTabs.find((item) => item.id === tab) ?? showcaseTabs[0];
    const activeInvoice = invoices.find((invoice) => invoice.id === invoiceId);

    // Retain the 1000px preview window and its 420px mobile minimum around the shared AppShell.
    return (
        <Section
            className="relative z-20 -mt-32 sm:-mt-48"
            padding={6}
            paddingBlock={10}
            paddingBlockStart={6}
            variant="transparent"
            aria-label="Example Showcase"
        >
            <Stack hAlign="center" className="mb-4">
                <Heading level={2} className="font-(family-name:--font-family-handwritten)">
                    Create the tools your business needs
                </Heading>
            </Stack>
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
                            label="Interactive invoice showcase"
                        >
                            <PlatformFrame
                                height="fill"
                                className="h-full"
                                breadcrumb={
                                    <Breadcrumbs separator=">" variant="supporting" label="Showcase breadcrumb">
                                        <BreadcrumbItem
                                            href="#showcase-cards"
                                            onClick={(event) => {
                                                // Return to the showcase's first tab without leaving the homepage.
                                                event.preventDefault();
                                                setTab('cards');
                                                setInvoiceId(null);
                                            }}
                                        >
                                            <Wordmark />
                                        </BreadcrumbItem>
                                        <BreadcrumbItem
                                            href={activeInvoice ? `#showcase-${activeTab.id}` : undefined}
                                            isCurrent={!activeInvoice}
                                            onClick={(event) => {
                                                // Return from invoice details to the current showcase tab.
                                                event.preventDefault();
                                                setInvoiceId(null);
                                            }}
                                        >
                                            Example Showcase
                                        </BreadcrumbItem>
                                        {activeInvoice && (
                                            <BreadcrumbItem isCurrent>{activeInvoice.name}</BreadcrumbItem>
                                        )}
                                    </Breadcrumbs>
                                }
                                action={<Avatar name="Example user" src="/favicon.svg?v=2" />}
                                navigation={
                                    <TabList
                                        value={activeTab.id}
                                        onChange={(value) => {
                                            // Open each tab at its main view without discarding local edits.
                                            setTab(value);
                                            setInvoiceId(null);
                                        }}
                                        role="tablist"
                                        aria-label="Example Showcase views"
                                        size="sm"
                                    >
                                        {showcaseTabs.map((item) => (
                                            <Tab
                                                key={item.id}
                                                value={item.id}
                                                label={item.label}
                                                panelId={`showcase-${item.id}`}
                                                icon={<FileText aria-hidden="true" size={16} />}
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
                                        {activeInvoice ? (
                                            <Stack gap={4}>
                                                <Button
                                                    label={`Back to ${activeTab.label.toLowerCase()}`}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setInvoiceId(null)}
                                                />
                                                <Heading level={2}>{activeInvoice.name}</Heading>
                                                <Currency value={activeInvoice.price} currency="CHF" locale="de-CH" />
                                                <Text color="secondary">Created by {activeInvoice.createdBy}</Text>
                                                <Selector
                                                    label="Status"
                                                    value={activeInvoice.status}
                                                    options={['draft', 'pending', 'approved']}
                                                    onChange={(status) => {
                                                        // Accept only invoice statuses and update this local preview record.
                                                        if (
                                                            status !== 'draft' &&
                                                            status !== 'pending' &&
                                                            status !== 'approved'
                                                        )
                                                            return;

                                                        setInvoices((current) =>
                                                            current.map((invoice) =>
                                                                invoice.id === activeInvoice.id
                                                                    ? { ...invoice, status }
                                                                    : invoice
                                                            )
                                                        );
                                                    }}
                                                />
                                            </Stack>
                                        ) : (
                                            <>
                                                <Stack gap={0}>
                                                    <Heading level={2}>Example {activeTab.label} View</Heading>
                                                    <Text color="secondary">{activeTab.description}</Text>
                                                </Stack>
                                                {activeTab.id === 'cards' && (
                                                    <Grid columns={{ minWidth: 200, max: 3 }} gap={4}>
                                                        {invoices.map((invoice) => (
                                                            <Card
                                                                key={invoice.id}
                                                                label={invoice.name}
                                                                variant="muted"
                                                                padding={4}
                                                                onClick={() => setInvoiceId(invoice.id)}
                                                            >
                                                                <Stack gap={3}>
                                                                    <Stack
                                                                        direction="horizontal"
                                                                        justify="between"
                                                                        align="center"
                                                                        gap={2}
                                                                        wrap="wrap"
                                                                    >
                                                                        <Heading level={3}>{invoice.name}</Heading>
                                                                        <Badge
                                                                            label={invoice.status}
                                                                            variant={
                                                                                invoice.status === 'approved'
                                                                                    ? 'success'
                                                                                    : invoice.status === 'pending'
                                                                                      ? 'warning'
                                                                                      : 'neutral'
                                                                            }
                                                                        />
                                                                    </Stack>
                                                                    <Currency
                                                                        value={invoice.price}
                                                                        currency="CHF"
                                                                        locale="de-CH"
                                                                    />
                                                                    <Text color="secondary">{invoice.createdBy}</Text>
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
                                                {activeTab.id === 'steps' && (
                                                    <Stepper
                                                        activeStep={0}
                                                        orientation="vertical"
                                                        onStepClick={(index) => {
                                                            // Open the invoice represented by this step without leaving the showcase.
                                                            const invoice = invoices[index];

                                                            if (invoice) setInvoiceId(invoice.id);
                                                        }}
                                                    >
                                                        {['Step one', 'Step two', 'Step three', 'Step four'].map(
                                                            (label, index) => (
                                                                <Step
                                                                    key={label}
                                                                    step={index}
                                                                    label={label}
                                                                    description={`Open invoice ${invoices[index]?.name ?? ''}.`}
                                                                />
                                                            )
                                                        )}
                                                    </Stepper>
                                                )}
                                                {activeTab.id === 'table' && (
                                                    <Table
                                                        data={invoices}
                                                        idKey="id"
                                                        density="compact"
                                                        hasHover
                                                        columns={[
                                                            {
                                                                key: 'name',
                                                                header: 'Invoice',
                                                                width: proportional(2),
                                                                renderCell: (invoice) => (
                                                                    <Link
                                                                        href="#showcase-invoice"
                                                                        onClick={(event) => {
                                                                            // Keep invoice navigation local to the homepage preview.
                                                                            event.preventDefault();
                                                                            setInvoiceId(invoice.id);
                                                                        }}
                                                                    >
                                                                        {invoice.name}
                                                                    </Link>
                                                                ),
                                                            },
                                                            {
                                                                key: 'price',
                                                                header: 'Amount',
                                                                width: proportional(1),
                                                                renderCell: (invoice) => (
                                                                    <Currency
                                                                        value={invoice.price}
                                                                        currency="CHF"
                                                                        locale="de-CH"
                                                                    />
                                                                ),
                                                            },
                                                            {
                                                                key: 'createdBy',
                                                                header: 'Created by',
                                                                width: proportional(2),
                                                                renderCell: (invoice) => (
                                                                    <Stack
                                                                        direction="horizontal"
                                                                        align="center"
                                                                        gap={2}
                                                                    >
                                                                        <Avatar name={invoice.createdBy} size="sm" />
                                                                        <Stack gap={0}>
                                                                            <Text>{invoice.createdBy}</Text>
                                                                            <Timestamp
                                                                                value={invoice.createdAt}
                                                                                format="date"
                                                                            />
                                                                        </Stack>
                                                                    </Stack>
                                                                ),
                                                            },
                                                            {
                                                                key: 'status',
                                                                header: 'Status',
                                                                width: proportional(1),
                                                                renderCell: (invoice) => (
                                                                    <Badge
                                                                        label={invoice.status}
                                                                        variant={
                                                                            invoice.status === 'approved'
                                                                                ? 'success'
                                                                                : invoice.status === 'pending'
                                                                                  ? 'warning'
                                                                                  : 'neutral'
                                                                        }
                                                                    />
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
