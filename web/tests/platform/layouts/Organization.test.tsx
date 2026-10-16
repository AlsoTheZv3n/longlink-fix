// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../render';
import Layout from '@/platform/layouts/Organization';

it('scopes organization navigation to the selected slug', () => {
    // Act
    const output = renderPlatform(<Layout />, '/orgs/acme', [], '/orgs/:organization');

    // Assert
    expect(output.querySelector('a[href="/orgs/acme"]')).not.toBeNull();
    expect(output.querySelector('a[href="/orgs/acme/settings"]')).not.toBeNull();
});
