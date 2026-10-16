// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../../render';
import Page from '@/platform/routes/usecases/Index';

it('links the showcase to its published screening example', () => {
    // Act
    const output = renderStatic(<Page />);

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Use Cases');
    expect(output.querySelector('a[href="/use-cases/real-estate/property-acquisition-screening/"]')).not.toBeNull();
});
