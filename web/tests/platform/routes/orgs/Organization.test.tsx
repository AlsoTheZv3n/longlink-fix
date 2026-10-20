// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import Page from '@/platform/routes/orgs/Organization';
import { renderPlatform, membership } from '../../render';

it('offers Solution onboarding for the resolved Organization', () => {
    // Act
    const output = renderPlatform(
        <Page />,
        '/orgs/acme',
        [
            [`/api/v1/organizations/${membership.organization.id}/solutions`, []],
            [
                `/api/v1/organizations/${membership.organization.id}/tags`,
                [{ id: '00000000-0000-4000-8000-000000000003', name: 'All', kind: 'all', icon: 'app-window' }],
            ],
        ],
        '/orgs/:organization'
    );

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Your Solutions');
    expect(output.textContent).toContain('Create solution');
});
