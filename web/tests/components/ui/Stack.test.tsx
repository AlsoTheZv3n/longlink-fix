// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Stack, StackItem } from '@/components/ui/Stack';

it('renders stack item content', () => {
    // Act
    const output = renderStatic(
        <Stack>
            <StackItem>Retained draft</StackItem>
        </Stack>
    );

    // Assert
    expect(output.textContent).toBe('Retained draft');
});
