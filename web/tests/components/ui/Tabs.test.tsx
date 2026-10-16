// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Tabs, Tab } from '@/components/ui/Tabs';

it('falls back to the first tab for an unknown controlled selection', () => {
    // Act
    const output = renderStatic(
        <Tabs value="missing">
            <Tab label="Orders" value="orders">
                Order list
            </Tab>
            <Tab label="Archive" value="archive">
                Archived list
            </Tab>
        </Tabs>
    );

    // Assert
    expect(output.querySelector('[role="tabpanel"]')?.textContent).toBe('Order list');
    expect(output.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toContain('Orders');
});
