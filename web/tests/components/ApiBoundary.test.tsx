// @vitest-environment happy-dom
import { Suspense } from 'react';
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { ApiErrorContext } from '@/lib/errors';
import { ApiBoundary } from '@/components/ApiBoundary';

it('uses the caller-selected loading fallback for suspended reads', () => {
    // Arrange
    const pending = new Promise<never>(() => undefined);

    function Pending(): never {
        throw pending;
    }

    // Act
    const output = renderStatic(
        <ApiErrorContext value={() => undefined}>
            <Suspense>
                <ApiBoundary fallback={<p>Loading orders</p>}>
                    <Pending />
                </ApiBoundary>
            </Suspense>
        </ApiErrorContext>
    );

    // Assert
    expect(output.textContent).toBe('Loading orders');
});
