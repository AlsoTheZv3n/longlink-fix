import { useState } from 'react';
import ViewLayout from './ViewLayout';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { DropdownMenu } from '@/components/ui/DropdownMenu';

/** Documents DropdownMenu in LongLink Views. */
export default function DropdownMenuPage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="DropdownMenu"
            introduction={'Opens an action menu using standard adaptive presentation and placement.'}
            properties={[
                {
                    name: 'button',
                    type: '{ label: string; variant?: "ghost" | "primary" | "secondary" | "destructive"; size?: "sm" | "lg" | "md"; isDisabled?: boolean; }',
                    description:
                        'Props for the trigger button (Button props except onClick). Mutually exclusive with `trigger`.',
                },
                {
                    name: 'items',
                    type: 'DropdownMenuOption[]',
                    description:
                        'Array of menu entries. Each entry is one of: an action item `{label, onClick?, href?, target?, rel?, icon?, description?, endContent?, isDisabled?, variant?, hasCloseOnSelect?, id?}` (`href` makes the row a real link, so a modified click keeps the browser\'s meaning; variant `"destructive"` renders it in the error color; `endContent` holds trailing content such as a keyboard-shortcut hint; `id` is the row\'s stable React key, needed only when the array reorders or filters), a divider `{type: "divider"}`, or a section `{type: "section", title?, id?, items: [...action items]}`.',
                },
                {
                    name: 'isMenuOpen',
                    type: 'boolean',
                    description:
                        'Controlled open state for the menu. Mounting with true renders the menu open without moving focus into it; focus moves to the first item only when the menu opens after mount.',
                },
                {
                    name: 'onOpenChange',
                    type: '(isOpen: boolean) => void',
                    description: 'Callback fired when the open state changes.',
                },
            ]}
            examples={[
                {
                    title: 'DropdownMenu',
                    preview: <DropdownMenuExample />,
                    code: `function Example() {
  return (
    <DropdownMenu
      button={{ label: 'Actions' }}
      items={[{ id: 'edit', label: 'Edit', onClick: () => navigate('/edit') }]}
    />
  );
}`,
                },
            ]}
        />
    );
}

/** Demonstrates menu actions with feedback confined to the example. */
export function DropdownMenuExample() {
    const [action, setAction] = useState('');

    // Report simulated actions without changing the clipboard.
    return (
        <Stack gap={2}>
            <DropdownMenu
                button={{ label: 'Edit', size: 'sm' }}
                items={[
                    { label: 'Copy', onClick: () => setAction('Copied') },
                    { label: 'Paste', onClick: () => setAction('Pasted') },
                ]}
            />
            {action && <Text role="status">{action}</Text>}
        </Stack>
    );
}
