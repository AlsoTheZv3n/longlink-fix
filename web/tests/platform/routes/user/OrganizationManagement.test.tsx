// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Management from '@/platform/routes/user/OrganizationManagement';

it('uses settings presentation instead of onboarding for an empty membership list', () => {
    // Act
    const output = renderPlatform(<Management presentation="settings" />, '/user/settings', [
        ['/api/v1/me/organizations', []],
    ]);

    // Assert
    expect(output.querySelector('h2')?.textContent).toBe('Organizations');
    expect(output.querySelector('h1')).toBeNull();
});
