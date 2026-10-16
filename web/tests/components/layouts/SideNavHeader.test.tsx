// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { SideNavHeader } from '@/components/layouts/SideNavHeader';

it('provides an accessible route back to the public home page', () => {
    // Act
    const output = renderStatic(<SideNavHeader />);

    // Assert
    expect(output.querySelector('a[href="/"]')?.getAttribute('aria-label')).toBe('LongLink home');
});
