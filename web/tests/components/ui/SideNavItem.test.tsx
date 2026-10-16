// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { SideNavItem } from '@/components/ui/SideNavItem';

it('uses a real router link for the authored destination', () => {
    // Act
    const output = renderStatic(<SideNavItem label="Orders" href="/orders" />);

    // Assert
    expect(output.querySelector('a')?.getAttribute('href')).toBe('/orders');
});
