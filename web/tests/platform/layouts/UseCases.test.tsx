// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import Layout from '@/platform/layouts/UseCases';

it('identifies the current screening detail while linking back to the collection', () => {
    // Act
    const output = renderStatic(<Layout />, '/use-cases/real-estate/property-acquisition-screening');

    // Assert
    expect(output.querySelector('[aria-current="page"]')?.textContent).toContain('Property Acquisition Screening');
    expect(output.querySelector('a[href="/use-cases/"]')).not.toBeNull();
});
