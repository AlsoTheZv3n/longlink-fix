import { Icon, type StoneIconName } from './Icon';
import { Token as AstryxToken } from '@astryxdesign/core/Token';

/** Displays a tag, category, or selection with optional click and removal actions. */
export function Token(props: {
    /** Hides the component without unmounting it. */
    hidden?: boolean;
    /** Visible text and accessible name for the token. Long labels truncate to fit. */
    label: string;
    size?: 'sm' | 'md' | 'lg';
    color?: 'default' | 'gray' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink';
    icon?: StoneIconName;
    disabled?: boolean;
    /** Accessible description of the tag or selection. */
    description?: string;
    /** Runs when the token is clicked. Use Button or Link for primary actions or navigation. */
    onClick?: () => void;
    /** Shows a remove button and runs when it is clicked. */
    onRemove?: () => void;
}) {
    // Forward only the supported metadata and actions, without unrestricted links or styling.
    return (
        <AstryxToken
            hidden={props.hidden}
            className={props.hidden ? 'hidden!' : undefined}
            label={props.label}
            size={props.size ?? 'md'}
            color={props.color ?? 'default'}
            icon={props.icon ? <Icon icon={props.icon} size="sm" /> : undefined}
            isDisabled={props.disabled ?? false}
            description={props.description}
            onClick={props.onClick}
            onRemove={props.onRemove}
        />
    );
}
