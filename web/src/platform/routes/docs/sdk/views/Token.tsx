import { useState } from 'react';
import ViewLayout from './ViewLayout';
import { Stack } from '@/components/ui/Stack';
import { Token } from '@/components/ui/Token';

/** Documents tags and removable selections in LongLink Views. */
export default function TokenPage() {
    // Show metadata tokens and a selection that can be removed without navigating.
    return (
        <ViewLayout
            name="Token"
            examples={[
                {
                    title: 'Interests',
                    preview: <TokenExample />,
                    code: `function Example() {
  return (
    <Stack direction="horizontal" wrap="wrap" gap={2}>
      <Token label="Research" />
      <Token label="Open source" color="blue" />
    </Stack>
  );
}`,
                },
                {
                    title: 'Removable selection',
                    preview: <RemovableTokenExample />,
                    code: `function Example() {
  const [selected, setSelected] = useState(true);
  return selected ? <Token label="Research" onRemove={() => setSelected(false)} /> : null;
}`,
                },
            ]}
        />
    );
}

/** Renders interest tokens for the documentation page and catalog. */
export function TokenExample() {
    // Keep related metadata together in a wrapping row.
    return (
        <Stack direction="horizontal" wrap="wrap" gap={2}>
            <Token label="Research" />
            <Token label="Open source" color="blue" />
        </Stack>
    );
}

/** Demonstrates removing a selected tag. */
function RemovableTokenExample() {
    // Remove the selection only after its accessible remove button is activated.
    const [selected, setSelected] = useState(true);

    return selected ? <Token label="Research" onRemove={() => setSelected(false)} /> : null;
}
