// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { useApiError } from '@/lib/errors';
import SolutionRoot from '@/solution/root';
import { Route, Routes } from 'react-router';

it('supplies the shared request error boundary to routed children', () => {
    // Arrange
    function Page() {
        useApiError();

        return <main>Resolved route</main>;
    }

    // Act
    const output = renderStatic(
        <Routes>
            <Route element={<SolutionRoot />}>
                <Route path="/" element={<Page />} />
            </Route>
        </Routes>
    );

    // Assert
    expect(output.querySelector('main')?.textContent).toBe('Resolved route');
});
