// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../../render';
import Page from '@/platform/routes/usecases/Screening';

it('publishes the workflow explanation alongside its illustrative calculator', () => {
    // Act
    const output = renderStatic(<Page />);

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Property Acquisition Screening');
    expect(output.querySelector('#screening-calculator-title')?.textContent).toBe('Estimate potential savings');
});
