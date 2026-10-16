// @vitest-environment happy-dom
import { act } from 'react';
import { it, expect } from 'vitest';
import { withMounted } from '../../render';
import { useVisibility } from '@/components/ui/menus';

it('does not acquire local visibility when the caller controls the menu', async () => {
    // Arrange
    const changes: boolean[] = [];

    function Probe() {
        const visibility = useVisibility(false, false, (open) => changes.push(open));

        return <button onClick={() => visibility.onOpenChange(true)}>{String(visibility.isMenuOpen)}</button>;
    }

    // Act
    await withMounted(<Probe />, async (output) => {
        await act(async () => output.querySelector('button')?.click());

        // Assert
        expect(changes).toEqual([true]);
        expect(output.textContent).toBe('false');
    });
});
