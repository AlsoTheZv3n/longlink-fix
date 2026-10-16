// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { MultiSelector } from '@/components/ui/MultiSelector';

it('serializes each selected option under the same field name', () => {
    // Act
    const output = renderStatic(
        <MultiSelector label="Tags" name="tags" options={['red', 'blue']} defaultValue={['red', 'blue']} />
    );

    // Assert
    expect([...output.querySelectorAll('input[name="tags"]')].map((input) => input.getAttribute('value'))).toEqual([
        'red',
        'blue',
    ]);
});
