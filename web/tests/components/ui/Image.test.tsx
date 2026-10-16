// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Image } from '@/components/ui/Image';

it('renders inline images without requiring a host capability', () => {
    // Arrange
    const src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E';

    // Act
    const output = renderStatic(<Image src={src} alt="Order preview" />);

    // Assert
    expect(output.querySelector('img')?.getAttribute('src')).toBe(src);
    expect(output.querySelector('img')?.getAttribute('alt')).toBe('Order preview');
});
