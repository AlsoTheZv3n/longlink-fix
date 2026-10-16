// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Link } from '@/components/ui/Link';

it('keeps a Solution-relative destination on the rendered link', () => {
    // Act
    const output = renderStatic(<Link to="/orders">Orders</Link>);

    // Assert
    expect(output.querySelector('a')?.getAttribute('href')).toBe('/orders');
    expect(output.querySelector('a')?.textContent).toBe('Orders');
});
