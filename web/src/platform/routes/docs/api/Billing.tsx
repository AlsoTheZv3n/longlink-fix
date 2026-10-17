import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Heading';
import { Table, proportional } from '@astryxdesign/core/Table';
import * as schemas from '@/lib/generated/platform-api-v1/zod.gen';
import { DocumentationArticle } from '@/platform/components/Article';

const article = {
    title: 'Billing | LongLink Platform Documentation',
    description: 'Understand Organization usage, payment methods, and monthly invoices.',
    toc: [
        { id: 'billing', label: 'Billing', level: 1 },
        { id: 'payment-methods', label: 'Payment Methods', level: 2 },
        { id: 'invoices', label: 'Invoices', level: 2 },
    ],
    lastUpdated: '2026-10-17',
    editUrl: 'https://github.com/xLongLink/longlink/edit/main/web/src/platform/routes/docs/api/Billing.tsx',
};

/** Documents Organization billing in one Platform article using the current pricing constants. */
export default function Billing() {
    const rates = schemas.zUsageRates.parse({});

    const resources = [
        {
            id: 'users',
            resource: 'Users',
            included: `${rates.free_users} users`,
            rate: `CHF ${(rates.user_monthly_price / 100).toFixed(2)} per additional user`,
        },
        {
            id: 'database',
            resource: 'Database',
            included: `${rates.free_database_bytes / 1024 ** 2} MiB`,
            rate: `CHF ${(rates.database_gib_monthly_price / 100).toFixed(2)} per additional GiB`,
        },
        {
            id: 'storage',
            resource: 'File storage',
            included: `${rates.free_storage_bytes / 1024 ** 3} GiB`,
            rate: `CHF ${(rates.storage_gib_monthly_price / 100).toFixed(2)} per additional GiB`,
        },
    ];

    return (
        <DocumentationArticle article={article}>
            <Stack gap={5}>
                <Heading id="billing" level={1}>
                    Billing
                </Heading>
                <Text as="p">
                    Manage usage, payment methods, and invoices in Organization Settings → Billing. You only pay for
                    usage above the free amounts below.
                </Text>
                <Table
                    data={resources}
                    idKey="id"
                    density="compact"
                    columns={[
                        { key: 'resource', header: 'Resource', width: proportional(1) },
                        { key: 'included', header: 'Included free', width: proportional(1) },
                        { key: 'rate', header: 'Monthly excess rate', width: proportional(2) },
                    ]}
                />
                <Heading id="payment-methods" level={2}>
                    Payment Methods
                </Heading>
                <Text as="p">
                    An Organization owner can open Billing → Payment Methods and select Add card. Stripe securely
                    collects the card details. Saving a card does not take an immediate payment.
                </Text>
                <Text as="p">
                    The most recently added card becomes the default for monthly payments. A saved card is required
                    before adding users beyond the free allowance.
                </Text>
                <Heading id="invoices" level={2}>
                    Invoices
                </Heading>
                <Text as="p">
                    Stripe charges your default card monthly in CHF for usage above the free amounts. If everything
                    stays within those amounts, no invoice is created.
                </Text>
                <Text as="p">
                    Owners can open Billing → Invoices to view invoices and payment status. Select an invoice number to
                    open it, or PDF to download a copy when available.
                </Text>
                <Text as="p">
                    Contact{' '}
                    <Link href="mailto:info@longlink.dev" hasUnderline type="inherit">
                        info@longlink.dev
                    </Link>{' '}
                    if you need help with a payment or invoice.
                </Text>
            </Stack>
        </DocumentationArticle>
    );
}
