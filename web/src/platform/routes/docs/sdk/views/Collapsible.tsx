import ViewLayout from './ViewLayout';
import { Text } from '@astryxdesign/core/Text';
import { Collapsible } from '@/components/ui/Collapsible';

/** Documents Collapsible in LongLink Views. */
export default function CollapsiblePage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="Collapsible"
            introduction={'Shows or hides content using controlled or initially open state.'}
            properties={[
                {
                    name: 'children',
                    type: 'ReactNode',
                    description: 'Content that collapses and expands.',
                },
                {
                    name: 'trigger',
                    type: 'ReactNode',
                    description: 'Content shown in the trigger area (always visible).',
                },
                {
                    name: 'defaultIsOpen',
                    type: 'boolean',
                    description:
                        'Default open state for standalone uncontrolled usage. Ignored when value binds the item to a surrounding CollapsibleGroup.',
                },
                {
                    name: 'isOpen',
                    type: 'boolean',
                    description:
                        'Controlled open state for standalone usage. Ignored when value binds the item to a surrounding CollapsibleGroup.',
                },
                {
                    name: 'isDisabled',
                    type: 'boolean',
                    description:
                        "Disable the item so its trigger can't be toggled (dimmed, aria-disabled, and out of the tab order). Doesn't collapse an already-open item.",
                },
                {
                    name: 'onOpenChange',
                    type: '(isOpen: boolean) => void',
                    description:
                        'Callback invoked when standalone open state changes. A surrounding CollapsibleGroup owns grouped state and calls its onChange instead.',
                },
            ]}
            examples={[
                {
                    title: 'Collapsible',
                    preview: <CollapsibleExample />,
                    code: `function Example() {
  return (
    <Collapsible trigger="Details">
      <Text>Additional information</Text>
    </Collapsible>
  );
}`,
                },
            ]}
        />
    );
}

/** Lets the disclosure own its initially expanded state. */
export function CollapsibleExample() {
    // Expand or collapse the additional information on demand.
    return (
        <Collapsible trigger="Details">
            <Text color="secondary">Additional information.</Text>
        </Collapsible>
    );
}
