// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import PlatformRoot from '@/platform/root';
import { Route, Routes } from 'react-router';

it('retains the routed Platform content within shared providers', () => {
    // Act
    const output = renderStatic(
        <Routes>
            <Route element={<PlatformRoot />}>
                <Route path="/" element={<main>Platform page</main>} />
            </Route>
        </Routes>
    );

    // Assert
    expect(output.querySelector('main')?.textContent).toBe('Platform page');
});
