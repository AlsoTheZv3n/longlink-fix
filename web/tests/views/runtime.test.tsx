// @vitest-environment happy-dom
import { it, expect, vi } from 'vitest';

it('ignores a mismatched session and releases an admitted port when its mount is absent', async () => {
    // Arrange
    window.__VIEW_SESSION__ = 'runtime-test-session';
    const channel = new MessageChannel();
    const close = vi.spyOn(channel.port1, 'close');

    // Act
    try {
        await import('@/views/runtime');

        const proof = {
            source: 'export default function View() { return null; }',
            params: {},
            navigationBaseUrl: 'https://platform.example/',
        };

        window.dispatchEvent(
            new MessageEvent('message', {
                source: window,
                ports: [channel.port1],
                data: { ...proof, session: 'wrong-session' },
            })
        );

        // Assert
        expect(close).not.toHaveBeenCalled();
        window.dispatchEvent(
            new MessageEvent('message', {
                source: window,
                ports: [channel.port1],
                data: { ...proof, session: 'runtime-test-session' },
            })
        );
        expect(close).toHaveBeenCalledOnce();
    } finally {
        channel.port1.close();
        channel.port2.close();
        vi.restoreAllMocks();
    }
});
