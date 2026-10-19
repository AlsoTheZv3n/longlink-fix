import ViewLayout from './ViewLayout';
import { Table } from '@/components/ui/Table';

/** Documents Table in LongLink Views. */
export default function TablePage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="Table"
            introduction={'Displays data-driven rows without plugins or a second children-based table contract.'}
            properties={[
                {
                    name: 'data',
                    type: 'T[]',
                    description:
                        'Array of data items to render as rows. T must extend Record<string, unknown> (use `interface MyRow extends Record<string, unknown>` for custom types).',
                },
                {
                    name: 'hasHover',
                    type: 'boolean',
                    description: 'Applies a hover highlight background to rows on pointer devices.',
                },
                {
                    name: 'isStriped',
                    type: 'boolean',
                    description: 'Applies a background wash to even-numbered rows.',
                },
                {
                    name: 'columns',
                    type: '{ key: string; header?: ReactNode; width?: ColumnWidth; align?: "start" | "center" | "end"; renderCell?: ((row: T) => ReactNode); }[]',
                    description:
                        'Column definitions: each column has {key, header, width?, align?, renderCell?}. The `header` field sets the column heading text. If omitted, columns are auto-generated from data object keys. The `width` field is typed as `ColumnWidth` (not a number); use `proportional(n)` or `pixel(n)` helpers imported from `@astryxdesign/core/Table`. Omitting `width` keeps an equal flexible share with a compact 60px readability floor. To give one column a different floor, set `width: proportional(1, {minWidth: 80})`; its `minWidth` replaces the 60px floor for that column. Example: `width: pixel(120)` for 120px fixed, `width: proportional(1)` for a flexible column with a 120px default minimum.',
                },
            ]}
            examples={[
                {
                    title: 'Table',
                    preview: <TableExample />,
                    code: `function Example() {
  return (
    <Table
      data={[{ id: '1', name: 'Order', status: 'Open' }]}
      columns={[
        { key: 'name', header: 'Name', width: proportional(2) },
        { key: 'status', header: 'Status', width: proportional(1) },
      ]}
    />
  );
}`,
                },
            ]}
        />
    );
}

/** Renders the page's table example for documentation and the catalog. */
export function TableExample() {
    // Display the sample order in compact, edge-to-edge rows.
    return (
        <Table
            data={[{ item: 'Order', status: 'Open' }]}
            columns={[
                { key: 'item', header: 'Item' },
                { key: 'status', header: 'Status' },
            ]}
        />
    );
}
