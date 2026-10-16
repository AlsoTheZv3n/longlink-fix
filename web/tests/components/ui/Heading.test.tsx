// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Heading } from '@/components/ui/Heading';

it('uses section heading semantics unless another level is requested', () => {
    // Act
    const output = renderStatic(<Heading>Orders</Heading>);

    // Assert
    expect(output.querySelector('h2')?.textContent).toBe('Orders');
});
