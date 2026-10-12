import type { ReactNode } from 'react';

/** Groups persistent fields into a direct child step of Form. Form owns field spacing, progress, validation, and navigation. */
export function FormStep(_props: {
    /** Visible label identifying this step in the progress indicator. */
    label: string;
    /** Fields arranged vertically with spacing step 3. Use an explicit layout child for custom grouping. */
    children?: ReactNode;
}) {
    // Form renders marker children without unmounting inactive fields.
    return null;
}
