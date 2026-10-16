// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/user/Organizations';

it('offers onboarding for a user without Organization memberships', () => {
    // Act
    const output = renderPlatform(<Page />, '/user/organizations', [['/api/v1/me/organizations', []]]);

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Your Organizations');
    expect(output.textContent).toContain('Create organization');
});
