// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { createRoutesStub } from 'react-router';
import { renderToStaticMarkup } from 'react-dom/server';
import { Document } from '@/components/layouts/Document';

it('publishes the common language, viewport, and favicon document contract', () => {
    // Arrange
    const Stub = createRoutesStub([
        {
            path: '/',
            Component: () => (
                <Document>
                    <main>Route content</main>
                </Document>
            ),
        },
    ]);

    // Act
    const markup = renderToStaticMarkup(<Stub initialEntries={['/']} />);

    // Assert
    expect(markup).toContain('<html lang="en">');
    expect(markup).toContain('width=device-width, initial-scale=1.0');
    expect(markup).toContain('/favicon.svg?v=2');
    expect(markup).toContain('Route content');
});
