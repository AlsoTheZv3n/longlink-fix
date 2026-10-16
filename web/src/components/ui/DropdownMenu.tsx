import * as menus from './menus';
import type { DropdownMenuOption } from './menus';
import { DropdownMenu as AstryxDropdownMenu } from '@astryxdesign/core/DropdownMenu';

export type { DropdownMenuItemData, DropdownMenuOption } from './menus';

/** Opens an action menu using standard adaptive presentation and placement. */
export function DropdownMenu(props: {
    /** Hides the trigger and closes its popup without unmounting the component. */
    hidden?: boolean;
    button?: {
        label: string;
        variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
        size?: 'sm' | 'md' | 'lg';
        isDisabled?: boolean;
    };
    items: DropdownMenuOption[];
    isMenuOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}) {
    // Own uncontrolled visibility so hiding also closes a popup outside the trigger's subtree.
    const visibility = menus.useVisibility(props.hidden, props.isMenuOpen, props.onOpenChange);

    // Supply an accessible trigger while preserving uncontrolled menu state.
    return (
        <AstryxDropdownMenu
            {...props}
            items={menus.icons(props.items)}
            className={props.hidden ? 'hidden!' : undefined}
            {...visibility}
            button={{
                ...(props.button ?? { label: 'Menu', variant: 'secondary', size: 'md', isDisabled: false }),
                hidden: props.hidden,
                className: props.hidden ? 'hidden!' : undefined,
            }}
        />
    );
}
