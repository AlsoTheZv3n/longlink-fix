import { it, expect } from 'vitest';
// @vitest-environment happy-dom
import { createElement } from 'react';
import { withMounted } from '../../render';
import { useFragmentToken } from '@/lib/hooks/use-fragment-token';

it('recovers an already captured token without rewriting an unrelated URL', async () => {
    // Arrange
    sessionStorage.setItem('test.verification', 'captured-token');

    function Probe() {
        return useFragmentToken('test.verification');
    }

    // Act
    try {
        await withMounted(createElement(Probe), async (output) => {
            // Assert
            expect(output.textContent).toBe('captured-token');
        });
    } finally {
        sessionStorage.removeItem('test.verification');
    }
});
