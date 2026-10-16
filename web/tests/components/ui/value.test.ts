import { it, expect } from 'vitest';
import { withMounted } from '../../render';
// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { useValue } from '@/components/ui/value';

it('reports controlled edits without changing the caller-owned value', async () => {
    // Arrange
    const changes: string[] = [];

    function Probe() {
        const field = useValue('saved', 'default', (value) => changes.push(value));

        return createElement('button', { onClick: () => field.onChange('edited') }, field.value);
    }

    // Act
    await withMounted(createElement(Probe), async (output) => {
        await act(async () => output.querySelector('button')?.click());

        // Assert
        expect(changes).toEqual(['edited']);
        expect(output.textContent).toBe('saved');
    });
});
