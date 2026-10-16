// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { PageContainer } from '@/components/PageContainer';

it('preserves authored container semantics and content', () => {
    // Act
    const output = renderStatic(
        <PageContainer as="main" aria-label="Orders">
            Order list
        </PageContainer>
    );

    // Assert
    expect(output.querySelector('main[aria-label="Orders"]')?.textContent).toBe('Order list');
});
