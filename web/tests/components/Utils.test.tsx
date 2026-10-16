// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { PageError } from '@/components/Utils';

it('presents unavailable pages with an explicit primary heading and explanation', () => {
    // Act
    const output = renderStatic(<PageError title="Orders unavailable" description="Please retry later." />);

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Orders unavailable');
    expect(output.textContent).toContain('Please retry later.');
});
