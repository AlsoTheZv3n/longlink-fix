// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Icon } from '@/components/ui/Icon';

it('renders bundled aliases without requesting an external glyph', () => {
    // Act
    const output = renderStatic(<Icon icon="search" size="md" />);

    // Assert
    expect(output.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(output.querySelector('svg path')).not.toBeNull();
});
