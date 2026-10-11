/** Opens existing invoices and creates new ones with persistent fields across steps. */
export default function InvoiceSteps() {
    // Mount a fresh form for each new invoice while preserving edits between steps.
    const [open, setOpen] = useState(false);

    // Use the first four real invoices as destinations rather than assuming seeded IDs.
    const [invoices] = useApi('/api/items?page=1&page_size=4');

    // Let the bounded Form own progress and the independently scrollable fields.
    return (
        <Stack gap={4}>
            <Stack gap={0}>
                <Heading level={1}>Example Steps View</Heading>
                <Text color="secondary">This can be used for opening invoices and guiding multi-step creation.</Text>
            </Stack>
            <Stepper
                orientation="vertical"
                onStepClick={(index) => {
                    // Reuse an available invoice, or the existing creation dialog when none exist.
                    const invoice = invoices.items[index] ?? invoices.items[0];

                    if (invoice) navigate(`/table/${invoice.id}`);
                    else setOpen(true);
                }}
            >
                {['Step one', 'Step two', 'Step three', 'Step four'].map((label, index) => {
                    // Describe the same invoice destination used when this step is activated.
                    const invoice = invoices.items[index] ?? invoices.items[0];

                    return (
                        <Step
                            key={label}
                            step={index}
                            label={label}
                            description={invoice ? `Open invoice ${invoice.name}.` : 'Create a new invoice.'}
                        />
                    );
                })}
            </Stepper>
            <Dialog
                aria-label="New Invoice"
                isOpen={open}
                onOpenChange={setOpen}
                purpose="form"
                padding={0}
                contentWidth="100%"
            >
                {open && (
                    <Form
                        action="/api/items"
                        height="100%"
                        submitLabel="Create Invoice"
                        onSuccess={(invoice) => {
                            setOpen(false);
                            navigate(`/table/${invoice.id}`);
                        }}
                    >
                        <Heading level={2}>New Invoice</Heading>
                        <FormStep label="Invoice">
                            <TextInput label="Invoice number" name="name" required />
                        </FormStep>
                        <FormStep label="Amount">
                            <NumberInput label="Amount (CHF)" name="price" defaultValue={0} min={0} required />
                        </FormStep>
                        <FormStep label="Approval">
                            <Selector
                                label="Status"
                                name="status"
                                defaultValue="draft"
                                options={[
                                    { value: 'draft', label: 'Draft' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'approved', label: 'Approved' },
                                ]}
                            />
                        </FormStep>
                    </Form>
                )}
            </Dialog>
        </Stack>
    );
}
