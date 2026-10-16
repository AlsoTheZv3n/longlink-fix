// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { PathBreadcrumb } from '@/components/breadcrumb/Path';

it('links ancestors but identifies the current page without a redundant link', () => {
    // Act
    const output = renderStatic(<PathBreadcrumb labels={{ docs: 'Documentation' }} />, '/docs/storage');

    // Assert
    expect(output.querySelector('a[href="/docs/"]')?.textContent).toContain('Documentation');
    expect(output.querySelector('[aria-current="page"]')?.textContent).toContain('Storage');
    expect(output.querySelector('a[href="/docs/storage/"]')).toBeNull();
});
