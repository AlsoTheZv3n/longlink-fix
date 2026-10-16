// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Table } from '@/components/ui/Table';

it('renders domain rows without inventing table actions', () => {
    // Act
    const output = renderStatic(
        <Table data={[{ id: '1', name: 'Acme' }]} idKey="id" columns={[{ key: 'name', header: 'Customer' }]} />
    );

    // Assert
    expect(output.querySelector('table')?.textContent).toContain('Customer');
    expect(output.querySelector('table')?.textContent).toContain('Acme');
});
