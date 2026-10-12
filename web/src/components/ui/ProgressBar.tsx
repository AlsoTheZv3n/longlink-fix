import { ProgressBar as AstryxProgressBar } from '@astryxdesign/core/ProgressBar';

/** Displays determinate or indeterminate progress with a semantic state. */
export function ProgressBar(props: {
    /** Hides the component without unmounting it. */
    hidden?: boolean;
    label: string;
    value?: number;
    max?: number;
    hasValueLabel?: boolean;
    variant?: 'accent' | 'success' | 'warning' | 'error' | 'neutral';
    marks?: ReadonlyArray<{ value: number; label: string }>;
    isDisabled?: boolean;
    isLabelHidden?: boolean;
    isIndeterminate?: boolean;
}) {
    // Default to visible, determinate progress on a percentage scale.
    return (
        <AstryxProgressBar
            {...props}
            className={props.hidden ? 'hidden!' : undefined}
            value={props.value ?? 0}
            max={props.max ?? 100}
            isLabelHidden={props.isLabelHidden ?? false}
            hasValueLabel={props.hasValueLabel ?? false}
            variant={props.variant ?? 'accent'}
            isIndeterminate={props.isIndeterminate ?? false}
        />
    );
}
