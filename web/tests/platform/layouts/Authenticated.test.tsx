// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../render';
import Layout from '@/platform/layouts/Authenticated';

it('does not mount protected content while the identity request is unresolved', () => {
    // Act
    const output = renderPlatform(<Layout />, '/user/organizations');

    // Assert
    expect(output.textContent).toContain('Loading account');
    expect(output.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
});
