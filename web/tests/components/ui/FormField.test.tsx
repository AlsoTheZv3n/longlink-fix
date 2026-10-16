// @vitest-environment happy-dom
import { useRef } from 'react';
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { FormField } from '@/components/ui/FormField';

it('serializes each authored string once and excludes disabled carriers', () => {
    // Arrange
    function Probe() {
        const ref = useRef<HTMLElement>(null);

        return (
            <FormField label="Tags" name="tags" fieldRef={ref} values={['red', 'blue']} serialize disabled>
                Tags
            </FormField>
        );
    }

    // Act
    const output = renderStatic(<Probe />);

    // Assert
    expect([...output.querySelectorAll('input[name="tags"]')].map((input) => input.getAttribute('value'))).toEqual([
        'red',
        'blue',
    ]);
    expect([...output.querySelectorAll('input')].every((input) => input.disabled)).toBe(true);
});
