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
        <Stack gap={0}>
            <Heading level={1}>Example Menu View</Heading>
            <Text color="secondary">This can be used for organizing settings into navigable sections.</Text>
            <Menu>
                <MenuSection title="Invoices">
                    <MenuItem label="General">
                        <Stack gap={4} maxWidth={640}>
                            <Heading level={2}>General</Heading>
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
                </MenuSection>
            </Menu>
        </Stack>
    );
}
