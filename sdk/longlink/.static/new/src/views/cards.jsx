/** Displays invoices as a gallery linking to their approval details. */
export default function InvoiceCards() {
    // Load one page of invoices through the shared Solution data cache.
    const [page, setPage] = useState(1);
    const [invoices] = useApi(`/api/items?page=${page}&page_size=8`);

    // Keep each invoice's status and amount visible before opening its details.
    return (
        <Stack gap={4}>
            <Stack gap={0}>
                <Heading level={1}>Example Cards View</Heading>
                <Text color="secondary">This can be used for comparing invoices in a gallery.</Text>
            </Stack>
            <Grid columns={3} gap={4}>
                {invoices.items.map((invoice) => (
                    <Card
                        key={invoice.id}
                        href={`/table/${invoice.id}`}
                        label={invoice.name}
                        padding={4}
                        variant="muted"
                    >
                        <Stack gap={3}>
                            <Stack direction="horizontal" justify="between" align="center" gap={2} wrap="wrap">
                                <Heading level={2}>{invoice.name}</Heading>
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
                            <Currency value={invoice.price} currency="CHF" locale="de-CH" />
                            {invoice.created_at && <Timestamp value={invoice.created_at} format="date" />}
                            {invoice.created_by && <Text color="secondary">{invoice.created_by.name}</Text>}
                        </Stack>
                    </Card>
                ))}
            </Grid>
            {invoices.total === 0 && <Text color="secondary">No invoices yet.</Text>}
            <Stack direction="horizontal" justify="between" gap={2}>
                <Button label="Previous" disabled={page === 1} onClick={() => setPage(page - 1)} />
                <Button label="Next" disabled={invoices.total <= page * 8} onClick={() => setPage(page + 1)} />
            </Stack>
        </Stack>
    );
}
