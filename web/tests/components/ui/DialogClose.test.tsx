// @vitest-environment happy-dom
import { act } from 'react';
import { it, expect, vi } from 'vitest';
import { withMounted } from '../../render';
import { DialogClose } from '@/components/ui/DialogClose';

it('invokes caller-owned dismissal without submitting a form', async () => {
    // Arrange
    const close = vi.fn();

    // Act
    await withMounted(<DialogClose onClose={close} />, async (output) => {
        await act(async () => output.querySelector('button')?.click());

        // Assert
        expect(close).toHaveBeenCalledOnce();
        expect(output.querySelector('button')?.getAttribute('type')).toBe('button');
    });
});
