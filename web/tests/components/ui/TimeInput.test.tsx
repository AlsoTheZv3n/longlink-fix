// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { TimeInput } from '@/components/ui/TimeInput';
import { createISOTimeString } from '@astryxdesign/core/utils';

it('serializes one canonical time rather than picker display fields', () => {
    // Act
    const output = renderStatic(
        <TimeInput label="Start time" name="start" defaultValue={createISOTimeString('09:30') ?? undefined} />
    );

    // Assert
    expect(output.querySelector('input[name="start"]')?.getAttribute('value')).toBe('09:30');
    expect(output.querySelectorAll('[name="start"]')).toHaveLength(1);
});
