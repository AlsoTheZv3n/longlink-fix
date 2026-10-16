// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../render';
import Layout from '@/platform/layouts/Admin';

it('does not reveal administrator navigation to a regular Platform user', () => {
    // Act
    const output = renderPlatform(<Layout />, '/admin/users');

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe("We can't find that page");
    expect(output.querySelector('a[href="/admin/compute"]')).toBeNull();
});
