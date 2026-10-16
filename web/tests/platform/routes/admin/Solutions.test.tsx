// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/admin/Solutions';

it('keeps empty Solution results searchable without opening a deletion dialog', () => {
    // Act
    const output = renderPlatform(<Page />, '/admin/solutions', [
        ['/api/v1/solutions?page=1&page_size=25&search=', { items: [], total: 0 }],
    ]);

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Solutions');
    expect(output.querySelector('input')?.getAttribute('placeholder')).toContain('organization');
    expect(output.querySelector('[role="alertdialog"]')).toBeNull();
});
