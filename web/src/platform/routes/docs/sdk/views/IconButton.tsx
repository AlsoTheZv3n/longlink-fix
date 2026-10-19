import { useState } from 'react';
import ViewLayout from './ViewLayout';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { IconButton } from '@/components/ui/IconButton';

/** Documents IconButton in LongLink Views. */
export default function IconButtonPage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="IconButton"
            introduction={'Runs a labeled icon action with automatic async feedback.'}
            properties={[
                {
                    name: 'label',
                    type: 'string',
                    description: 'Accessible label. Used as aria-label (not rendered as visible text).',
                },
                {
                    name: 'icon',
                    type: 'StoneIconName',
                    description:
                        'Icon element rendered inside the button. An Astryx Icon with no explicit size defaults to sm for sm/md buttons and md for lg buttons.',
                },
                {
                    name: 'variant',
                    type: '"ghost" | "primary" | "secondary" | "destructive"',
                    description: 'Visual style variant.',
                },
                {
                    name: 'size',
                    type: '"sm" | "lg" | "md"',
                    description: 'Size variant.',
                },
                {
                    name: 'tooltip',
                    type: 'string',
                    description: 'Tooltip text shown on hover.',
                },
                {
                    name: 'isDisabled',
                    type: 'boolean',
                    description: 'Disables the button.',
                },
                {
                    name: 'onClick',
                    type: '(event: ViewMouseEvent) => void | Promise<void>',
                    description: 'Standard click handler.',
                },
            ]}
            examples={[
                {
                    title: 'IconButton',
                    preview: <IconButtonExample />,
                    code: `function Example() {
  return (
    <IconButton
      label="Refresh"
      icon="refresh"
      onClick={async () => {
        await request('/api/refresh', { method: 'POST' });
      }}
    />
  );
}`,
                },
            ]}
        />
    );
}

/** Demonstrates an icon action with local feedback. */
export function IconButtonExample() {
    const [action, setAction] = useState('');

    // Report the close action without dismissing the documentation.
    return (
        <Stack gap={2}>
            <IconButton icon="close" label="Close" size="sm" tooltip="Close" onClick={() => setAction('Closed')} />
            {action && <Text role="status">{action}</Text>}
        </Stack>
    );
}
