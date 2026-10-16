// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/admin/Users';

it('renders an empty server page without inventing user records', () => {
    // Act
    const output = renderPlatform(<Page />, '/admin/users', [
        ['/api/v1/users?page=1&page_size=25&search=', { items: [], total: 0 }],
    ]);

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Users');
    expect(output.querySelector('input')?.getAttribute('placeholder')).toBe('Search by name or email');
});
