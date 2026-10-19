import ViewLayout from './ViewLayout';
import FormPreview from './FormPreview';
import { FormStep } from '@/components/ui/FormStep';
import { TextInput } from '@/components/ui/TextInput';
import { NumberInput } from '@/components/ui/NumberInput';

/** Documents browser-native form authoring using a local, non-networked submission preview. */
export default function FormPage() {
    // Keep LongLink-specific examples and guidance beside the field contract.
    return (
        <ViewLayout
            name="Form"
            isLongLinkSpecific
            properties={[
                {
                    name: 'children',
                    type: 'ReactNode',
                    description:
                        'Named controls and layout, or direct FormStep children for automatic navigation. Next validates the current step and shared fields; final submission validates all steps and reveals the first invalid field. Inactive fields remain mounted and enabled.',
                },
                {
                    name: 'action',
                    type: 'string',
                    description: 'Solution-relative API path; external URLs are not supported.',
                },
                {
                    name: 'method',
                    type: '"delete" | "post" | "put" | "patch"',
                    description: 'Write method used to submit the form; defaults to post.',
                },
                {
                    name: 'id',
                    type: 'string',
                    description: 'Native form ID for associating external submit or reset buttons.',
                },
                {
                    name: 'height',
                    type: 'string | number',
                    description:
                        'Bounds the form height. With FormStep children, pins progress above centered, independently scrollable fields, including inside a Dialog.',
                },
                {
                    name: 'submitLabel',
                    type: 'string',
                    description:
                        'Label for the automatic final submit button when using FormStep children; defaults to Save.',
                },
                {
                    name: 'onSuccess',
                    type: '(data: ViewData) => void | Promise<void>',
                    description: 'Runs after a successful write and automatic cached-data refresh.',
                },
            ]}
            introduction={
                'Form submits named fields to a Solution API without draft state, imports, or page navigation. Form validation runs before the request; Python schemas remain authoritative. Set height on a multi-step Form to pin progress above centered, independently scrollable fields. Inside a Dialog, the Form owns its height and layout without additional dialog configuration.'
            }
            examples={[
                {
                    title: 'Create an item form',
                    preview: <FormExample />,
                    code: `/** Creates an item using named themed fields. */
export default function CreateItem() {
  return (
    <Form action="/api/items" method="post">
      <TextInput name="name" label="Name" required />
      <NumberInput name="price" label="Price" min={0} defaultValue={0} required />
      <Stack direction="horizontal" gap={2}>
        <Button type="submit" label="Submit" variant="primary" />
        <Button type="reset" label="Reset" />
      </Stack>
    </Form>
  );
}`,
                },
                {
                    title: 'Bounded multi-step form',
                    preview: (
                        <FormPreview stepped height={560}>
                            <FormStep label="Identity">
                                <TextInput name="name" label="Name" required />
                            </FormStep>
                            <FormStep label="Details">
                                <NumberInput name="price" label="Price" min={0} required />
                            </FormStep>
                        </FormPreview>
                    ),
                    code: `/** Creates an item using automatic step navigation and validation. */
export default function CreateItem() {
  return (
    <Form action="/api/items" submitLabel="Create item" height={560}>
      <FormStep label="Identity">
        <TextInput name="name" label="Name" required />
      </FormStep>
      <FormStep label="Details">
        <NumberInput name="price" label="Price" min={0} required />
      </FormStep>
    </Form>
  );
}`,
                },
            ]}
        />
    );
}

/** Shows a complete form with local submission output and native reset behavior. */
function FormExample() {
    // Exercise the real Form with a local capability rather than disabling its controls.
    return (
        <FormPreview>
            <TextInput name="name" label="Name" required />
            <NumberInput name="price" label="Price" min={0} defaultValue={0} required />
        </FormPreview>
    );
}
