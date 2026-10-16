// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Layout, LayoutContent, LayoutHeader, LayoutFooter } from '@/components/ui/Layout';

it('keeps each authored layout region within its named landmark', () => {
    // Act
    const output = renderStatic(
        <Layout
            header={<LayoutHeader label="Tools">Actions</LayoutHeader>}
            footer={<LayoutFooter label="Summary">Total</LayoutFooter>}
        >
            <LayoutContent label="Orders">Orders</LayoutContent>
        </Layout>
    );

    // Assert
    expect(output.querySelector('[aria-label="Tools"]')?.textContent).toContain('Actions');
    expect(output.querySelector('[aria-label="Orders"]')?.textContent).toContain('Orders');
    expect(output.querySelector('[aria-label="Summary"]')?.textContent).toContain('Total');
});
