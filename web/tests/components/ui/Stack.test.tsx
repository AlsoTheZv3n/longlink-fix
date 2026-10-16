// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Stack, StackItem } from '@/components/ui/Stack';

it('keeps hidden layout content mounted', () => {
    // Act
    const output = renderStatic(
        <Stack hidden>
            <StackItem>Retained draft</StackItem>
        </Stack>
    );

    // Assert
    expect(output.textContent).toBe('Retained draft');
    expect(output.querySelector('.hidden\\!')).not.toBeNull();
});
