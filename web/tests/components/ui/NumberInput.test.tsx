// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { NumberInput } from '@/components/ui/NumberInput';

it('does not invent zero for an omitted numeric field', () => {
    // Act
    const output = renderStatic(<NumberInput label="Quantity" name="quantity" />);

    // Assert
    expect(output.querySelector('input[name="quantity"]')?.getAttribute('value')).toBe('');
});
