// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import Layout from '@/platform/layouts/Documentation';

it('selects Platform navigation for API documentation', () => {
    // Act
    const output = renderStatic(<Layout />, '/docs/api');

    // Assert
    expect(output.querySelector('[aria-label="Documentation sections"] [aria-current="true"]')?.textContent).toContain(
        'Platform'
    );
    expect(output.querySelector('[aria-label="Documentation navigation"] a[href="/docs/sdk/storage/"]')).toBeNull();
});
