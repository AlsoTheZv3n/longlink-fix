// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { SideLayout } from '@/components/layouts/SideLayout';

it('keeps side navigation and page content in the same shell', () => {
    // Act
    const output = renderStatic(
        <SideLayout sideNav={<nav aria-label="Documentation">Navigation</nav>}>Article content</SideLayout>
    );

    // Assert
    expect(output.querySelector('nav[aria-label="Documentation"]')?.textContent).toBe('Navigation');
    expect(output.textContent).toContain('Article content');
});
