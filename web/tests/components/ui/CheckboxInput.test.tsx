// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { CheckboxInput } from '@/components/ui/CheckboxInput';

it('maps field names and required state onto the native checkbox', () => {
    // Act
    const output = renderStatic(<CheckboxInput name="accepted" label="Accept terms" required defaultChecked />);

    // Assert
    expect(output.querySelector('input')?.getAttribute('name')).toBe('accepted');
    expect(output.querySelector('input')?.hasAttribute('required')).toBe(true);
    expect(output.querySelector('input')?.hasAttribute('checked')).toBe(true);
});
