import { useState } from 'react';
import ViewLayout from './ViewLayout';
import { Stack } from '@/components/ui/Stack';
import { Button } from '@/components/ui/Button';
import { Step, Stepper } from '@/components/ui/Stepper';

/** Documents Stepper in LongLink Views. */
export default function StepperPage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="Stepper"
            introduction={'Displays the current step using standard progress indicators.'}
            properties={[
                {
                    name: 'children',
                    type: 'ReactNode',
                    description: 'Step elements to render in the stepper.',
                },
                {
                    name: 'activeStep',
                    type: 'number',
                    description:
                        'Zero-based index of the currently active step. Steps before this index are marked as completed.',
                },
                {
                    name: 'orientation',
                    type: '"horizontal" | "vertical"',
                    description: 'Layout direction of the stepper.',
                },
                {
                    name: 'onStepClick',
                    type: '(index: number) => void',
                    description: "Enables step activation and receives the clicked step's zero-based index.",
                },
                {
                    name: 'Step.step',
                    type: 'number',
                    description: 'Zero-based index of this step in the process.',
                },
                {
                    name: 'Step.label',
                    type: 'string',
                    description: 'Visible label identifying the step.',
                },
                {
                    name: 'Step.description',
                    type: 'string',
                    description: 'Supporting text displayed below the step label.',
                },
                {
                    name: 'Step.children',
                    type: 'ReactNode',
                    description:
                        "Content below the label and description, outside the step's activation button. Compact horizontal steppers hide it without unmounting.",
                },
            ]}
            examples={[
                {
                    title: 'Stepper',
                    preview: <StepperExample />,
                    code: `function Example() {
  return (
    <Stepper activeStep={1}>
      <Step step={0} label="Details" />
      <Step step={1} label="Review" />
      <Step step={2} label="Complete" />
    </Stepper>
  );
}`,
                },
                {
                    title: 'Step actions',
                    preview: <StepActionsExample />,
                    code: `function Example() {
  const [approved, setApproved] = useState(false);

  return (
    <Stepper activeStep={1} orientation="vertical">
      <Step
        step={0}
        label="contract-v1.pdf"
        description="Uploaded by Ana on Oct 2"
      >
        <Button label="Download" size="sm" />
      </Step>
      <Step
        step={1}
        label="contract-v2.pdf"
        description="Uploaded by Ben on Oct 9"
      >
        <Stack direction="horizontal" gap={2} align="center" wrap="wrap">
          <Button label="Download" size="sm" />
          {!approved && <Button label="Approve" variant="primary" size="sm" onClick={() => setApproved(true)} />}
        </Stack>
      </Step>
    </Stepper>
  );
}`,
                },
            ]}
        />
    );
}

/** Demonstrates per-step actions on an upload timeline without leaving the documentation page. */
function StepActionsExample() {
    const [approved, setApproved] = useState(false);

    // Offer downloads for every upload and approval only while the latest upload is pending.
    return (
        <Stepper activeStep={1} orientation="vertical">
            <Step step={0} label="contract-v1.pdf" description="Uploaded by Ana on Oct 2">
                <Button label="Download" size="sm" />
            </Step>
            <Step step={1} label="contract-v2.pdf" description="Uploaded by Ben on Oct 9">
                <Stack direction="horizontal" gap={2} align="center" wrap="wrap">
                    <Button label="Download" size="sm" />
                    {!approved && (
                        <Button label="Approve" variant="primary" size="sm" onClick={() => setApproved(true)} />
                    )}
                </Stack>
            </Step>
        </Stepper>
    );
}

/** Renders the page's stepper example for documentation and the catalog. */
export function StepperExample({ orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' }) {
    // Show the review stage in a three-step process.
    return (
        <Stepper activeStep={1} orientation={orientation}>
            <Step step={0} label="Details" />
            <Step step={1} label="Review" />
            <Step step={2} label="Complete" />
        </Stepper>
    );
}
