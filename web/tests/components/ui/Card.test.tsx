// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Card } from '@/components/ui/Card';

it('retains content without making a plain card an action', () => {
    // Act
    const output = renderStatic(<Card>Order summary</Card>);

    // Assert
    expect(output.textContent).toContain('Order summary');
    expect(output.querySelector('a, button')).toBeNull();
});
