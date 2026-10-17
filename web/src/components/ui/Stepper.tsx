import { Children, isValidElement, type ReactNode } from 'react';
import { Stepper as AstryxStepper, Step as AstryxStep } from '@astryxdesign/core/Stepper';

/** Displays the current step using standard progress indicators. */
export function Stepper({
    activeStep = 0,
    children,
    ...props
}: {
    /** Hides the component without unmounting it. */
    hidden?: boolean;
    children?: ReactNode;
    activeStep?: number;
    orientation?: 'horizontal' | 'vertical';
    /** Enables step activation and receives the clicked step's zero-based index. */
    onStepClick?: (index: number) => void;
}) {
    // Compact horizontal steppers render the active label outside the individual step's element.
    const activeStepHidden = Children.toArray(children).some(
        (child) =>
            isValidElement<Parameters<typeof Step>[0]>(child) &&
            child.type === Step &&
            child.props.step === activeStep &&
            child.props.hidden
    );

    // Show horizontal progress unless a vertical flow is requested.
    return (
        <AstryxStepper
            {...props}
            className={props.hidden ? 'hidden!' : activeStepHidden ? '[&_.astryx-stepper-summary]:hidden!' : undefined}
            activeStep={activeStep}
            orientation={props.orientation ?? 'horizontal'}
        >
            {children}
        </AstryxStepper>
    );
}

/** Defines the label, description, index, and content of a step. */
export function Step(props: {
    /** Hides the step indicator and label without changing its index. */
    hidden?: boolean;
    /** Zero-based index of this step in the process. */
    step: number;
    /** Visible label identifying the step. */
    label: string;
    /** Supporting text displayed below the step label. */
    description?: string;
    /** Content below the label and description, outside the step's activation button. Compact horizontal steppers hide it without unmounting. */
    children?: ReactNode;
}) {
    return <AstryxStep {...props} className={props.hidden ? 'hidden!' : undefined} />;
}
