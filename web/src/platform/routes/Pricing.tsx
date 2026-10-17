import { Text } from '@astryxdesign/core/Text';
import { Seo } from '@/platform/components/Seo';
import { Stack } from '@astryxdesign/core/Stack';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Section } from '@astryxdesign/core/Section';
import { Table, proportional } from '@astryxdesign/core/Table';
import * as schemas from '@/lib/generated/platform-api-v1/zod.gen';

/** Publishes usage pricing from generated backend defaults without introducing plans. */
export default function Pricing() {
    // Schema defaults come from the same constants used to calculate monthly invoices.
    const rates = schemas.zUsageRates.parse({});

    const resources = [
        {
            id: 'users',
            resource: 'Users',
            included: `First ${rates.free_users} users`,
            rate: `CHF ${(rates.user_monthly_price / 100).toFixed(2)} per additional user`,
        },
        {
            id: 'database',
            resource: 'Database',
            included: `${rates.free_database_bytes / 1024 ** 2} MiB database storage`,
            rate: `CHF ${(rates.database_gib_monthly_price / 100).toFixed(2)} per additional GiB`,
        },
        {
            id: 'storage',
            resource: 'File storage',
            included: `${rates.free_storage_bytes / 1024 ** 3} GiB file storage`,
            rate: `CHF ${(rates.storage_gib_monthly_price / 100).toFixed(2)} per additional GiB`,
        },
    ];

    return (
        <>
            <Seo
                description="Usage-based pricing for LongLink, with free users and storage included."
                title="Pricing | LongLink"
            />
            <main>
                <Section variant="transparent" padding={6}>
                    <Stack className="mx-auto" width="100%" maxWidth={1000} gap={10} align="center">
                        <Stack gap={3} align="center">
                            <Heading
                                className="font-(family-name:--font-family-handwritten) tracking-wide uppercase"
                                justify="center"
                                level={1}
                                textWrap="balance"
                                type="display-2"
                            >
                                Pricing
                            </Heading>
                            <Text as="p" color="secondary">
                                Billed per Organization
                            </Text>
                        </Stack>
                        <Table
                            data={resources}
                            idKey="id"
                            columns={[
                                { key: 'resource', header: 'Resource', width: proportional(1) },
                                { key: 'included', header: 'Included free', width: proportional(2) },
                                { key: 'rate', header: 'Monthly excess usage', width: proportional(2) },
                            ]}
                        />
                        <Button href="/user/organizations/" label="Get started" variant="primary" />
                        <Text as="p" type="supporting" justify="center">
                            LongLink is currently in beta. Pricing, limits, and included usage may change.
                        </Text>
                    </Stack>
                </Section>
            </main>
        </>
    );
}
