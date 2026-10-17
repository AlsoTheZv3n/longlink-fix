import { it, expect } from 'vitest';
import { resources } from '@/platform/pricing';

it('publishes CHF monthly excess rates with the public and documentation allowance wording', () => {
    // Assert
    expect(resources).toEqual([
        {
            id: 'users',
            resource: 'Users',
            included: '5 users',
            publicIncluded: 'First 5 users',
            rate: 'CHF 5.00 per additional user',
        },
        {
            id: 'database',
            resource: 'Database',
            included: '100 MiB',
            publicIncluded: '100 MiB database storage',
            rate: 'CHF 1.00 per additional GiB',
        },
        {
            id: 'storage',
            resource: 'File storage',
            included: '1 GiB',
            publicIncluded: '1 GiB file storage',
            rate: 'CHF 0.10 per additional GiB',
        },
    ]);
});
