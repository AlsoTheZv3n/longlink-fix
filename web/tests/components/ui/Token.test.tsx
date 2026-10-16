// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Token } from '@/components/ui/Token';

it('does not invent an action for a descriptive tag', () => {
    // Act
    const output = renderStatic(<Token label="Priority" description="Urgent orders" />);

    // Assert
    expect(output.textContent).toContain('Priority');
    expect(output.querySelector('button')).toBeNull();
});
