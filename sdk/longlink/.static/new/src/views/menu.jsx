/** Demonstrates settings panels with session-local values and side navigation. */
export default function InvoiceSettings() {
    // Retain edits when the menu unmounts an inactive settings panel.
    const [company, setCompany] = useState('Acme Ink');
    const [currency, setCurrency] = useState('CHF');
    const [approvalRequired, setApprovalRequired] = useState(true);
    const [approvalThreshold, setApprovalThreshold] = useState(1000);
    const [pendingNotifications, setPendingNotifications] = useState(true);
    const [approvedNotifications, setApprovedNotifications] = useState(false);

    // Keep section selection in the runtime-managed URL fragment.
    return (
        <Stack gap={4}>
            <Stack gap={0}>
                <Heading level={1}>Example Menu View</Heading>
                <Text color="secondary">This can be used for organizing settings into navigable sections.</Text>
            </Stack>
            <Menu>
                <MenuSection title="Invoices">
                    <MenuItem label="General">
                        <Stack gap={4} maxWidth={640}>
                            <Heading level={2}>General</Heading>
                            <Card padding={4}>
                                <Stack gap={4}>
                                    <TextInput label="Company name" value={company} onChange={setCompany} />
                                    <Selector
                                        label="Default currency"
                                        value={currency}
                                        onChange={setCurrency}
                                        options={[
                                            { value: 'CHF', label: 'Swiss franc (CHF)' },
                                            { value: 'EUR', label: 'Euro (EUR)' },
                                            { value: 'USD', label: 'US dollar (USD)' },
                                        ]}
                                    />
                                </Stack>
                            </Card>
                        </Stack>
                    </MenuItem>
                    <MenuItem label="Approvals">
                        <Stack gap={4} maxWidth={640}>
                            <Heading level={2}>Approvals</Heading>
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
                            <Heading level={2}>Notifications</Heading>
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
                    <MenuItem label="Billing">
                        <InvoiceBilling />
                    </MenuItem>
                </MenuSection>
            </Menu>
        </Stack>
    );
}

/** Loads demo usage only while the Billing settings panel is selected. */
function InvoiceBilling() {
    // Keep the plan action informational and local to this demo panel.
    const [planOpen, setPlanOpen] = useState(false);

    // Use the full invoice count rather than the size of a paginated result.
    const [invoices] = useApi('/api/items?page=1&page_size=1');

    // Match the Platform plan card while keeping the demo allowance illustrative, not enforced.
    return (
        <Stack gap={4}>
            <Stack justify="end" minHeight="var(--size-element-md)">
                <Heading level={2}>Billing</Heading>
            </Stack>
            <Divider />
            <Card padding={0} isClipped>
                <Stack gap={0}>
                    <Stack
                        direction="horizontal"
                        gap={3}
                        align="center"
                        paddingInline={4}
                        paddingBlock={2}
                        background="muted"
                    >
                        <Icon icon="user-round" size="lg" />
                        <StackItem size="fill">
                            <Stack gap={0}>
                                <Text as="h3" weight="medium">
                                    LongLink Demo
                                </Text>
                                <Text type="supporting">Demo plan. No charges.</Text>
                            </Stack>
                        </StackItem>
                        <Button label="View plan" size="sm" variant="primary" onClick={() => setPlanOpen(true)} />
                    </Stack>
                    <Divider />
                    <Stack gap={4} padding={4}>
                        <ProgressBar
                            label="Invoice usage"
                            value={invoices.total}
                            max={100}
                            hasValueLabel
                            formatValueLabel={() => `${invoices.total} / 100 invoices`}
                        />
                    </Stack>
                </Stack>
            </Card>
            <Dialog aria-label="Demo plan" isOpen={planOpen} onOpenChange={setPlanOpen} purpose="info">
                <Stack gap={4}>
                    <Heading level={2}>LongLink Demo</Heading>
                    <Text>This demo has no payment processing or enforced invoice limit.</Text>
                    <Button label="Close" onClick={() => setPlanOpen(false)} />
                </Stack>
            </Dialog>
        </Stack>
    );
}
