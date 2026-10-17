import { it, expect } from 'vitest';
// @vitest-environment happy-dom
import { createElement } from 'react';
import { withMounted } from '../../render';
import { useFragmentToken } from '@/lib/hooks/use-fragment-token';

it('recovers an already captured token without rewriting an unrelated URL', async () => {
    // Arrange
    const originalUrl = window.location.href;
    const originalState: unknown = window.history.state;
    const unrelatedUrl = new URL('/unrelated?keep=1#section', originalUrl).href;
    sessionStorage.setItem('test.verification', 'captured-token');

    function Probe() {
        return useFragmentToken('test.verification');
    }

    // Act
    try {
        window.history.replaceState(null, '', unrelatedUrl);
        await withMounted(createElement(Probe), async (output) => {
            // Assert
            expect(output.textContent).toBe('captured-token');
            expect(window.location.href).toBe(unrelatedUrl);
        });
    } finally {
        window.history.replaceState(originalState, '', originalUrl);
        sessionStorage.removeItem('test.verification');
    }
});
