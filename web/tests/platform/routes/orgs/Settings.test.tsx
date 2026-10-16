// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Settings from '@/platform/routes/orgs/Settings';

it('renders General without loading inactive billing or registry resources', () => {
    // Act
    const output = renderPlatform(<Settings />, '/orgs/acme/settings', [], '/orgs/:organization/settings');

    // Assert
    expect(output.textContent).toContain('Acme');
    expect(output.textContent).toContain('General');
    expect(output.querySelector('table')).toBeNull();
});
