// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Badge } from '@/components/ui/Badge';

it('renders the label', () => {
    // Act
    const output = renderStatic(<Badge label="12" />);

    // Assert
    expect(output.textContent).toBe('12');
});
