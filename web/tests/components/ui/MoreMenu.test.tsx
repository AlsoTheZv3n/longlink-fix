// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { MoreMenu } from '@/components/ui/MoreMenu';

it('preserves the accessible name of compact row actions', () => {
    // Act
    const output = renderStatic(<MoreMenu label="Order actions" items={[]} />);

    // Assert
    expect(output.querySelector('button')?.getAttribute('aria-label')).toBe('Order actions');
});
