// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { Footer } from '@/components/Footer';

it('publishes legal and documentation destinations in the public footer', () => {
    // Act
    const output = renderStatic(<Footer />);

    // Assert
    expect(output.querySelector('footer a[href="/docs/"]')).not.toBeNull();
    expect(output.querySelector('nav[aria-label="Legal navigation"] a[href="/privacy/"]')).not.toBeNull();
    expect(output.querySelector('a[target="_blank"]')?.getAttribute('rel')).toContain('noopener');
});
