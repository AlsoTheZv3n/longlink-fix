// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../render';
import Layout from '@/platform/layouts/OrganizationAccess';

it('keeps unresolved organization reads behind their loading boundary', () => {
    // Act
    const output = renderPlatform(<Layout />, '/orgs/acme', [], '/orgs/:organization');

    // Assert
    expect(output.textContent).toContain('Loading organization');
});
