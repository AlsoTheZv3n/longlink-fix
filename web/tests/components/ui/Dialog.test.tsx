// @vitest-environment happy-dom
import { act, useState } from 'react';
import { it, expect, vi } from 'vitest';
import { withMounted } from '../../render';
import { Dialog } from '@/components/ui/Dialog';

it('hides an open dialog without changing caller-owned state', async () => {
    // Arrange
    const change = vi.fn();

    /** Change only the visibility mask, leaving the caller's open state intact. */
    function Probe() {
        const [hidden, setHidden] = useState(false);

        return (
            <>
                <button type="button" onClick={() => setHidden(true)}>
                    Hide
                </button>
                <Dialog title="Edit order" isOpen hidden={hidden} onOpenChange={change}>
                    Draft
                </Dialog>
            </>
        );
    }

    // Act
    await withMounted(<Probe />, async (output) => {
        // Assert the dialog can render before testing its visibility mask.
        expect(document.querySelector('dialog[open]')).not.toBeNull();

        // Hide the dialog without changing its controlled open state.
        const hide = output.querySelector('button');

        if (!hide) throw new Error('Expected the visibility toggle');

        await act(async () => hide.click());

        // Assert
        expect(document.querySelector('dialog[open]')).toBeNull();
        expect(change).not.toHaveBeenCalled();
    });
});
