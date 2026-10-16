// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { ProgressBar } from '@/components/ui/ProgressBar';

it('exposes authored progress limits to assistive technology', () => {
    // Act
    const output = renderStatic(<ProgressBar label="Storage" value={25} max={50} />);

    // Assert
    expect(output.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe('25');
    expect(output.querySelector('[role="progressbar"]')?.getAttribute('aria-valuemax')).toBe('50');
});
