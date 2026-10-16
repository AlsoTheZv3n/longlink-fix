// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { TextInput } from '@/components/ui/TextInput';

it('preserves authored default values and submission names', () => {
    // Act
    const output = renderStatic(<TextInput label="Name" name="name" defaultValue="  Acme  " />);

    // Assert
    expect(output.querySelector('input[name="name"]')?.getAttribute('value')).toBe('  Acme  ');
    expect(output.querySelector('input')?.getAttribute('type')).toBe('text');
});
