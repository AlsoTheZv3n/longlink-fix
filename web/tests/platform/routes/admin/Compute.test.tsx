// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/admin/Compute';

it('offers registration for an empty Compute registry without exposing credentials', () => {
    // Act
    const output = renderPlatform(<Page />, '/admin/compute', [
        ['/api/v1/computes?page=1&page_size=25&search=', { items: [], total: 0 }],
    ]);

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Compute');
    expect(output.textContent).toContain('Register Compute');
    expect(output.querySelector('textarea')).toBeNull();
});
