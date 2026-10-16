// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import Page from '@/platform/routes/admin/Organizations';
import { renderPlatform, membership } from '../../render';

it('links an Organization row to its slug-based workspace', () => {
    // Act
    const output = renderPlatform(<Page />, '/admin/organizations', [
        ['/api/v1/organizations?page=1&page_size=25&search=', { items: [membership.organization], total: 1 }],
    ]);

    // Assert
    expect(output.querySelector('a[href="/orgs/acme"]')?.textContent).toBe('Acme');
    expect(output.querySelector('[role="alertdialog"]')).toBeNull();
});
