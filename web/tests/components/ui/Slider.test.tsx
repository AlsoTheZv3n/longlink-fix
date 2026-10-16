// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Slider } from '@/components/ui/Slider';

it('uses the supplied minimum as the omitted value default', () => {
    // Act
    const output = renderStatic(<Slider label="Quantity" name="quantity" min={5} max={20} />);

    // Assert
    expect(output.querySelector('input[name="quantity"]')?.getAttribute('value')).toBe('5');
});
