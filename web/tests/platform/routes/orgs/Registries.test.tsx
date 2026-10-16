// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Registries from '@/platform/routes/orgs/Registries';
import { zRegistryResponse } from '@/lib/generated/platform-api-v1/zod.gen';

it('shows connection identity without maintenance actions for readers', () => {
    // Arrange
    const connection = zRegistryResponse.parse({
        id: '00000000-0000-4000-8000-000000000003',
        provider: 'ghcr',
        host: 'ghcr.io',
        username: 'acme',
    });

    // Act
    const output = renderPlatform(<Registries base="/api/v1/organizations/acme" canMaintain={false} />, '/', [
        ['/api/v1/organizations/acme/registries', [connection]],
    ]);

    // Assert
    expect(output.textContent).toContain('ghcr.io');
    expect(output.textContent).toContain('acme');
    expect(output.textContent).not.toContain('Add registry');
    expect(output.textContent).not.toContain('Delete');
});
