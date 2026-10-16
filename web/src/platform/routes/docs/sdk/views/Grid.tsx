import ViewLayout from './ViewLayout';
import { Grid } from '@/components/ui/Grid';
import { Stack } from '@astryxdesign/core/Stack';

/** Documents Grid in LongLink Views. */
export default function GridPage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="Grid"
            introduction="Grid supports fixed columns or responsive tracks with columns={{ minWidth: 240, max: 3 }}. Responsive tracks reflow with the container width; use one-column or full GridSpan items with them. For unequal fixed-column layouts, collapseBelow={768} switches to a single column at narrow View viewport widths and makes spanning children full-width."
            examples={[
                {
                    title: 'Grid',
                    preview: <GridExample />,
                    code: `function Example() {
  return (
    <Grid columns={2} gap={3}>
      <Text>First column</Text>
      <GridSpan columns="full">
        <Text>Full-width content</Text>
      </GridSpan>
    </Grid>
  );
}`,
                },
            ]}
        />
    );
}

/** Renders the page's grid example for documentation and the catalog. */
export function GridExample() {
    // Arrange presentation-only items in two columns.
    return (
        <Grid columns={2} gap={2}>
            <Stack aria-hidden="true" className="h-5 w-16 rounded-full bg-neutral" />
            <Stack aria-hidden="true" className="h-5 w-16 rounded-full bg-neutral" />
            <Stack aria-hidden="true" className="h-5 w-16 rounded-full bg-neutral" />
            <Stack aria-hidden="true" className="h-5 w-16 rounded-full bg-neutral" />
        </Grid>
    );
}
