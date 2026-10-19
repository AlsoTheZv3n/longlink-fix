import { useState } from 'react';
import ViewLayout from './ViewLayout';
import { Card } from '@/components/ui/Card';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';

/** Documents plain, clickable, and selectable cards. */
export default function CardPage() {
    // Render the card contract alongside each supported interaction mode.
    return (
        <ViewLayout
            name="Card"
            isLongLinkSpecific
            properties={[
                {
                    name: 'children',
                    type: 'ReactNode',
                    description: 'Content rendered inside the card.',
                },
                {
                    name: 'padding',
                    type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
                    description: 'Inner spacing using the theme spacing scale.',
                },
                {
                    name: 'isClipped',
                    type: 'boolean',
                    description: "Clips full-bleed content to the card's rounded edges.",
                },
                {
                    name: 'variant',
                    type: '"muted" | "blue" | "cyan" | "green" | "orange" | "pink" | "purple" | "red" | "teal" | "yellow" | "default" | "gray" | "transparent"',
                    description: 'Background color variant, independent of the interaction mode.',
                },
                {
                    name: 'width',
                    type: 'string | number',
                    description: 'Card width; numbers are pixels and strings are CSS sizes.',
                },
                {
                    name: 'height',
                    type: 'string | number',
                    description: 'Card height; numbers are pixels and strings are CSS sizes.',
                },
                {
                    name: 'maxWidth',
                    type: 'string | number',
                    description: 'Maximum card width.',
                },
                {
                    name: 'minHeight',
                    type: 'string | number',
                    description: 'Minimum card height.',
                },
                {
                    name: 'inert',
                    type: 'boolean',
                    description: 'Makes the card and its descendants non-interactive.',
                },
                {
                    name: 'aria-hidden',
                    type: 'boolean | "true" | "false"',
                    description: 'Hides the card from assistive technologies.',
                },
                {
                    name: 'label',
                    type: 'string',
                    description: 'Accessible label for interactive cards; supply a descriptive label.',
                },
                {
                    name: 'onClick',
                    type: '(event: ViewMouseEvent) => void',
                    description:
                        'Makes the card clickable when its surface is activated; nested controls act independently.',
                },
                {
                    name: 'href',
                    type: 'string',
                    description:
                        'Solution-relative destination or HTTP(S) URL to open in a new tab when no selection callback is supplied.',
                },
                {
                    name: 'target',
                    type: 'string',
                    description:
                        'Native link target; isolated Views use the current Solution for relative paths and a new tab for HTTP(S) URLs.',
                },
                {
                    name: 'isDisabled',
                    type: 'boolean',
                    description: 'Disables activation of an interactive card.',
                },
                {
                    name: 'isSelected',
                    type: 'boolean',
                    description: 'Selection state; supply onChange to let users toggle it.',
                },
                {
                    name: 'onChange',
                    type: '(isSelected: boolean) => void',
                    description:
                        'Makes the card selectable and receives its next selection state; takes priority over onClick and href.',
                },
            ]}
            introduction="Card has one shared set of props. onChange makes it selectable, onClick or href makes it clickable, and otherwise it is a plain content card. Selection takes priority when both kinds of interaction props are supplied."
            examples={[
                {
                    title: 'Plain card',
                    preview: (
                        <Card padding={3}>
                            <Text>Order details</Text>
                        </Card>
                    ),
                    code: `function Example() {
  return (
    <Card padding={3}>
      <Text>Order details</Text>
    </Card>
  );
}`,
                },
                {
                    title: 'Clickable card',
                    preview: <ClickableCardExample />,
                    code: `function Example() {
  return (
    <Card label="View order" href="/orders/123">
      <Text>View order</Text>
    </Card>
  );
}`,
                },
                {
                    title: 'Selectable card',
                    preview: <SelectableCardExample />,
                    code: `function Example() {
  const [selected, setSelected] = useState(false);

  return (
    <Card label="Team plan" isSelected={selected} onChange={setSelected}>
      <Text>Team plan</Text>
    </Card>
  );
}`,
                },
            ]}
        />
    );
}

/** Demonstrates a clickable card without navigating to a nonexistent order. */
function ClickableCardExample() {
    const [action, setAction] = useState('');

    // Keep action feedback local instead of changing the documentation route.
    return (
        <Stack gap={2}>
            <Card label="View order" onClick={() => setAction('Viewing order 123')}>
                <Text>View order</Text>
            </Card>
            {action && <Text role="status">{action}</Text>}
        </Stack>
    );
}

/** Keeps selectable-card state local to this example. */
function SelectableCardExample() {
    const [selected, setSelected] = useState(false);

    // Retain selection when the card is activated by pointer or keyboard.
    return (
        <Card label="Team plan" isSelected={selected} onChange={setSelected}>
            <Text>Team plan</Text>
        </Card>
    );
}
