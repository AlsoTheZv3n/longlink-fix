import ViewLayout from './ViewLayout';
import FormPreview from './FormPreview';
import { RadioList, RadioListItem } from '@/components/ui/RadioList';

/** Documents RadioList in LongLink Views. */
export default function RadioListPage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="RadioList"
            introduction={'Selects one of a small number of labeled values.'}
            properties={[
                {
                    name: 'label',
                    type: 'string',
                    description: 'Label text for the radio group (always rendered for accessibility).',
                },
                {
                    name: 'description',
                    type: 'string',
                    description: 'Description text displayed below the label.',
                },
                {
                    name: 'name',
                    type: 'string',
                    description: "Includes the themed control's value under this form submission name.",
                },
                {
                    name: 'required',
                    type: 'boolean',
                    description: 'Requires a value before native form submission.',
                },
                {
                    name: 'disabled',
                    type: 'boolean',
                    description: 'Prevents interaction and excludes the field from submission.',
                },
                {
                    name: 'width',
                    type: 'string | number',
                    description:
                        'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned.',
                },
                {
                    name: 'children',
                    type: 'ReactNode',
                    description: 'RadioListItem elements.',
                },
                {
                    name: 'value',
                    type: 'string',
                    description: 'The currently selected value.',
                },
                {
                    name: 'defaultValue',
                    type: 'string',
                    description: 'The defaultValue prop.',
                },
                {
                    name: 'onChange',
                    type: '(value: string) => void',
                    description: 'Callback fired when the selected value changes.',
                },
                {
                    name: 'orientation',
                    type: '"horizontal" | "vertical"',
                    description: 'Layout direction of the radio items.',
                },
                {
                    name: 'size',
                    type: '"sm" | "md"',
                    description: 'Size of the radio controls.',
                },
                {
                    name: 'RadioListItem.label',
                    type: 'string',
                    description: 'Visible label identifying this choice.',
                },
                {
                    name: 'RadioListItem.value',
                    type: 'string',
                    description: 'Value passed to the surrounding RadioList when selected.',
                },
                {
                    name: 'RadioListItem.description',
                    type: 'string',
                    description: 'Optional helper text explaining the choice.',
                },
                {
                    name: 'RadioListItem.isDisabled',
                    type: 'boolean',
                },
            ]}
            examples={[
                {
                    title: 'Plan form',
                    preview: (
                        <FormPreview>
                            <RadioListExample />
                        </FormPreview>
                    ),
                    code: `/** Submits one plan from a native radio group. */
export default function PlanForm() {
  return (
    <Form action="/api/example" method="post">
      <RadioList name="plan" label="Plan" defaultValue="team" orientation="horizontal" required>
        <RadioListItem label="Solo" value="solo" />
        <RadioListItem label="Team" value="team" />
      </RadioList>
      <Stack direction="horizontal" gap={2}>
        <Button type="submit" label="Submit" variant="primary" />
        <Button type="reset" label="Reset" />
      </Stack>
    </Form>
  );
}`,
                },
            ]}
        />
    );
}

/** Shows a named radio group with one initial selection. */
export function RadioListExample() {
    // Let the group manage selection while the form collects only the checked value.
    return (
        <RadioList name="plan" label="Plan" defaultValue="team" orientation="horizontal" required>
            <RadioListItem label="Solo" value="solo" />
            <RadioListItem label="Team" value="team" />
        </RadioList>
    );
}
