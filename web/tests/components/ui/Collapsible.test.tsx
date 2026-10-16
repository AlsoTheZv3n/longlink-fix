// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Collapsible } from '@/components/ui/Collapsible';

it('honors an authored initially open disclosure', () => {
    // Act
    const output = renderStatic(
        <Collapsible trigger="Details" defaultIsOpen>
            Order details
        </Collapsible>
    );

    // Assert
    expect(output.querySelector('[aria-expanded="true"]')).not.toBeNull();
    expect(output.textContent).toContain('Order details');
});
