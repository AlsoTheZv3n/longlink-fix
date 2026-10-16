// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { DropdownMenu } from '@/components/ui/DropdownMenu';

it('retains an authored trigger without prematurely opening the popup', () => {
    // Act
    const output = renderStatic(<DropdownMenu button={{ label: 'Order actions' }} items={[]} />);

    // Assert
    expect(output.querySelector('button')?.textContent).toContain('Order actions');
    expect(output.querySelector('[role="menu"]')).toBeNull();
});
