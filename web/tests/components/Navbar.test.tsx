// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { Navbar } from '@/components/Navbar';

it('keeps sign-in and documentation reachable from public navigation', () => {
    // Act
    const output = renderStatic(<Navbar />);

    // Assert
    expect(output.querySelector('header a[href="/login/"]')?.textContent).toContain('Sign In');
    expect(output.querySelector('header a[href="/docs/"]')).not.toBeNull();
});
