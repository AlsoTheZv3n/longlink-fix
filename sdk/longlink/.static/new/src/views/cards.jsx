/** Displays invoices as a gallery linking to their approval details. */
export default function InvoiceCards() {
    // Load one page of invoices through the shared Solution data cache.
    const [page, setPage] = useState(1);
    const [invoices] = useApi(`/api/items?page=${page}&page_size=8`);

    // Reuse bundled example photos without changing invoice data or attachments.
    const photos = ['office', 'workspace', 'desk'];

    // Keep each invoice's status and amount visible before opening its details.
    return (
        <Stack gap={4}>
            <Stack gap={0}>
                <Heading level={1}>Example Cards View</Heading>
                <Text color="secondary">This can be used for comparing invoices in a gallery.</Text>
            </Stack>
            <Grid columns={{ minWidth: 240, max: 3 }} gap={2} align="stretch">
                {invoices.items.map((invoice) => (
                    <Card
                        key={invoice.id}
                        href={`/table/${invoice.id}`}
                        label={invoice.name}
                        padding={0}
                        height="100%"
                        variant="muted"
                        isClipped
                    >
                        <Stack gap={0}>
                            <Image
                                src={`/api/demo/photos/${photos[(invoice.id - 1) % photos.length]}`}
                                alt="Example laptop workspace photo"
                            />
                            <Stack gap={2} padding={3}>
                                <Text as="h2" type="label" maxLines={1}>
                                    {invoice.name}
                                </Text>
                                <Stack direction="horizontal" justify="between" align="center" gap={2}>
                                    <Currency value={invoice.price} currency="CHF" locale="de-CH" />
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
                                <Stack gap={0} minHeight="var(--size-element-md)">
                                    {invoice.created_at && (
                                        <Text type="supporting" maxLines={1}>
                                            <Timestamp value={invoice.created_at} format="date" />
                                        </Text>
                                    )}
                                    {invoice.created_by && (
                                        <Text type="supporting" maxLines={1}>
                                            {invoice.created_by.name}
                                        </Text>
                                    )}
                                </Stack>
                            </Stack>
                        </Stack>
                    </Card>
                ))}
            </Grid>
            {invoices.total === 0 && <Text color="secondary">No invoices yet.</Text>}
            <Pagination page={page} onPageChange={setPage} totalItems={invoices.total} pageSize={8} />
        </Stack>
    );
}
