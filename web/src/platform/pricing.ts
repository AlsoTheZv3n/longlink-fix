import * as schemas from '@/lib/generated/platform-api-v1/zod.gen';

// Schema defaults come from the same constants used to calculate monthly invoices.
const rates = schemas.zOrganizationUsage.omit({ users: true, stripe_enabled: true }).parse({});

export const resources = [
    {
        id: 'users',
        resource: 'Users',
        included: `${rates.free_users} users`,
        publicIncluded: `First ${rates.free_users} users`,
        rate: `CHF ${(rates.user_monthly_price / 100).toFixed(2)} per additional user`,
    },
    {
        id: 'database',
        resource: 'Database',
        included: `${rates.free_database_bytes / 1024 ** 2} MiB`,
        publicIncluded: `${rates.free_database_bytes / 1024 ** 2} MiB database storage`,
        rate: `CHF ${(rates.database_gib_monthly_price / 100).toFixed(2)} per additional GiB`,
    },
    {
        id: 'storage',
        resource: 'File storage',
        included: `${rates.free_storage_bytes / 1024 ** 3} GiB`,
        publicIncluded: `${rates.free_storage_bytes / 1024 ** 3} GiB file storage`,
        rate: `CHF ${(rates.storage_gib_monthly_price / 100).toFixed(2)} per additional GiB`,
    },
];
