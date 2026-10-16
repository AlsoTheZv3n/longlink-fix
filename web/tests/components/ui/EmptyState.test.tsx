// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { EmptyState } from '@/components/ui/EmptyState';

it('preserves the domain-specific empty-state explanation', () => {
    // Act
    const output = renderStatic(<EmptyState title="No orders yet" />);

    // Assert
    expect(output.textContent).toContain('No orders yet');
});
