// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Badge } from '@/components/ui/Badge';

it('retains the label when hidden rather than unmounting it', () => {
    // Act
    const output = renderStatic(<Badge label="12" hidden />);

    // Assert
    expect(output.textContent).toBe('12');
    expect(output.querySelector('.hidden\\!')).not.toBeNull();
});
