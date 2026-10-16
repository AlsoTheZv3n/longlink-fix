// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import Page from '@/platform/routes/orgs/Organization';
import { renderPlatform, membership } from '../../render';

it('offers Solution onboarding for the resolved Organization', () => {
    // Act
    const output = renderPlatform(
        <Page />,
        '/orgs/acme',
        [[`/api/v1/organizations/${membership.organization.id}/solutions`, []]],
        '/orgs/:organization'
    );

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Your Solutions');
    expect(output.textContent).toContain('Create solution');
});
