import { it, expect } from 'vitest';
import { createQueryRuntime, clearSessionQueries } from '@/lib/react-query';

it('removes prior-identity API data without clearing unrelated resources', async () => {
    // Arrange
    const runtime = createQueryRuntime(() => undefined, true);
    runtime.client.setQueryData(['api', '/api/v1/me'], { id: 'owner' });
    runtime.client.setQueryData(['api', '/api/v1/organizations'], ['private']);
    runtime.client.setQueryData(['view-runtime', 'version'], 'runtime');

    // Act
    try {
        await clearSessionQueries(runtime.client, true);

        // Assert
        expect(runtime.client.getQueryData(['api', '/api/v1/me'])).toEqual({ id: 'owner' });
        expect(runtime.client.getQueryData(['api', '/api/v1/organizations'])).toBeUndefined();
        expect(runtime.client.getQueryData(['view-runtime', 'version'])).toBe('runtime');
    } finally {
        runtime.client.clear();
    }
});
