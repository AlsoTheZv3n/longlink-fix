// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Button } from '@/components/ui/Button';

it('does not accidentally submit the surrounding form', () => {
    // Act
    const output = renderStatic(<Button label="Run action" />);

    // Assert
    expect(output.querySelector('button')?.getAttribute('type')).toBe('button');
    expect(output.textContent).toContain('Run action');
});
