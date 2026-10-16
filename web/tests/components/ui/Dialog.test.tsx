// @vitest-environment happy-dom
import { it, expect, vi } from 'vitest';
import { withMounted } from '../../render';
import { Dialog } from '@/components/ui/Dialog';

it('masks an open hidden dialog without changing caller-owned state', async () => {
    // Arrange
    const change = vi.fn();

    // Act
    await withMounted(
        <Dialog aria-label="Edit order" isOpen hidden onOpenChange={change}>
            Draft
        </Dialog>,
        async () => {
            // Assert
            expect(document.querySelector('[role="dialog"]')).toBeNull();
            expect(change).not.toHaveBeenCalled();
        }
    );
});
