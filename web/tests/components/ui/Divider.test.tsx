// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Divider } from '@/components/ui/Divider';

it('retains an authored separator label', () => {
    // Act
    const output = renderStatic(<Divider label="Archived orders" />);

    // Assert
    expect(output.textContent).toContain('Archived orders');
});
