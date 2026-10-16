// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Avatar } from '@/components/ui/Avatar';

it('retains a caller-supplied image rather than replacing it with generated artwork', () => {
    // Act
    const output = renderStatic(<Avatar name="Acme" kind="organization" src="https://images.example/acme.png" />);

    // Assert
    expect(output.querySelector('img')?.getAttribute('src')).toBe('https://images.example/acme.png');
});
