import ViewLayout from './ViewLayout';
import FormPreview from './FormPreview';
import { MultiSelector } from '@/components/ui/MultiSelector';

/** Documents MultiSelector in LongLink Views. */
export default function MultiSelectorPage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="MultiSelector"
            introduction={'Selects multiple values using standard option and selected-value rendering.'}
            properties={[
                {
                    name: 'label',
                    type: 'string',
                    description: 'Label text for accessibility.',
                },
                {
                    name: 'description',
                    type: 'string',
                    description: 'Helper text displayed below the label.',
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
                    name: 'options',
                    type: 'SelectorOptionType[]',
                    description:
                        'Array of items: strings, objects with value/label/icon/disabled, dividers, or sections. An option may carry `action`: one node — an IconButton, a Button, a menu trigger — the caller renders and names. Once any option does, the popup is a grid whose rows pair the option with its action: Up/Down move rows, the inline-end arrow reaches the action, Enter fires it, pointer and touch press it directly, and pressing it never changes the selection.',
                },
                {
                    name: 'value',
                    type: 'string[]',
                    description: 'Currently selected values.',
                },
                {
                    name: 'defaultValue',
                    type: 'string[]',
                    description: 'The defaultValue prop.',
                },
                {
                    name: 'onChange',
                    type: '(value: string[]) => void',
                    description:
                        'Called when the selection changes. A creation (hasCreate) arrives with `{type: "create", query}` as the second argument and the query appended to value; the caller adds the matching option in that same update. Every other change passes no descriptor, so a one-argument handler keeps working.',
                },
                {
                    name: 'placeholder',
                    type: 'string',
                    description: 'Placeholder text shown when no value is selected.',
                },
                {
                    name: 'size',
                    type: '"sm" | "lg" | "md"',
                    description: 'Size variant for the selector.',
                },
                {
                    name: 'hasSelectAll',
                    type: 'boolean',
                    description: 'Whether to show a select-all checkbox.',
                },
                {
                    name: 'hasSearch',
                    type: 'boolean',
                    description:
                        'Whether to show a search input for filtering options. As the user types, the match count (or "No results found") is announced to screen readers via a polite live region. The search field has built-in affordances: a leading magnifier icon and, once a query is typed, a trailing clear (✕) button that resets the query and returns focus to the input.',
                },
                {
                    name: 'hasClear',
                    type: 'boolean',
                    description: 'Shows a clear button when values are selected.',
                },
            ]}
            examples={[
                {
                    title: 'Teams form',
                    preview: (
                        <FormPreview>
                            <MultiSelectorExample />
                        </FormPreview>
                    ),
                    code: `/** Submits selected teams as repeated form entries. */
export default function TeamsForm() {
  return (
    <Form action="/api/example" method="post">
      <MultiSelector
        name="teams"
        label="Teams"
        options={['design', 'engineering', 'support']}
        defaultValue={['design', 'engineering']}
        required
      />
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

/** Shows a themed multiple selector without collapsing repeated submission names. */
export function MultiSelectorExample() {
    // Start with two teams so submission visibly demonstrates repeated entries.
    return (
        <MultiSelector
            name="teams"
            label="Teams"
            options={['design', 'engineering', 'support']}
            defaultValue={['design', 'engineering']}
            required
        />
    );
}
