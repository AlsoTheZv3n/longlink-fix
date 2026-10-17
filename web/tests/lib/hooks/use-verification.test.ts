import { it, expect } from 'vitest';
// @vitest-environment happy-dom
import { createElement } from 'react';
import { withMounted } from '../../render';
import { ErrorBoundary } from 'react-error-boundary';
import { useVerification, type VerificationRequest } from '@/lib/hooks/use-verification';

it('publishes successful verification and cleans up its signal on unmount', async () => {
    // Arrange
    const attempts: VerificationRequest[] = [];

    async function verify(request: VerificationRequest) {
        attempts.push(request);

        return 'verified';
    }

    function Probe() {
        return useVerification('proof', verify).verification;
    }

    // Act
    await withMounted(createElement(ErrorBoundary, { fallback: 'Failure' }, createElement(Probe)), async (output) => {
        // Assert
        expect(output.textContent).toBe('verified');
        expect(attempts[0]?.signal.aborted).toBe(false);
    });
    expect(attempts[0]?.token).toBe('proof');
    expect(attempts[0]?.signal.aborted).toBe(true);
});

it('cancels a pending credential exchange when its owning page unmounts', async () => {
    // Arrange
    const attempts: VerificationRequest[] = [];

    /** Keep the exchange pending until its signal is aborted. */
    function verify(request: VerificationRequest): Promise<string> {
        attempts.push(request);

        return new Promise((resolve) => {
            request.signal.addEventListener('abort', () => resolve('verified'), { once: true });
        });
    }

    /** Show whether verification completed before the page unmounts. */
    function Probe() {
        return useVerification('proof', verify).verification ?? 'Pending';
    }

    // Act
    await withMounted(createElement(ErrorBoundary, { fallback: 'Failure' }, createElement(Probe)), async (output) => {
        // Assert
        expect(output.textContent).toBe('Pending');
        expect(attempts).toHaveLength(1);
        expect(attempts[0]?.token).toBe('proof');
        expect(attempts[0]?.signal.aborted).toBe(false);
    });
    expect(attempts[0]?.signal.aborted).toBe(true);
});
