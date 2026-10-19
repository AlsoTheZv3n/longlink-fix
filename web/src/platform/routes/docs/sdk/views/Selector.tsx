import ViewLayout from './ViewLayout';
import FormPreview from './FormPreview';
import { Selector } from '@/components/ui/Selector';

/** Documents Selector in LongLink Views. */
export default function SelectorPage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="Selector"
            introduction={'Selects one value without custom option rendering or popup geometry.'}
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
                        'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned. Without a width the field follows its displayed value and can shrink with its row (the value truncates) instead of overflowing it; use `<HStack wrap="wrap">` for filter bars so selectors move to a second line on phones.',
                },
                {
                    name: 'options',
                    type: 'SelectorOptionType[]',
                    description:
                        'Array of items: strings, objects with value/label/description/icon/disabled, dividers ({type: "divider"}), or sections ({type: "section", title, options}).',
                },
                {
                    name: 'defaultValue',
                    type: 'string',
                    description: 'The defaultValue prop.',
                },
                {
                    name: 'hasSearch',
                    type: 'boolean',
                    description:
                        'Whether to show a search input for filtering options. As the user types, the match count (or "No results found") is announced to screen readers via a polite live region. The search field has built-in affordances: a leading magnifier icon and, once a query is typed, a trailing clear (✕) button that resets the query and returns focus to the input.',
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
                    name: 'hasClear',
                    type: '(false) | (true)',
                    description:
                        'Shows a clear (×) button when a value is selected. When true, onChange also accepts null to signal the user cleared the selection.',
                },
                {
                    name: 'value',
                    type: '(string) | (string | null)',
                    description: 'Currently selected value.',
                },
                {
                    name: 'onChange',
                    type: '((value: string) => void) | ((value: string | null) => void)',
                    description: 'Callback fired when the selection changes.',
                },
            ]}
            examples={[
                {
                    title: 'Status form',
                    preview: (
                        <FormPreview>
                            <SelectorExample />
                        </FormPreview>
                    ),
                    code: `/** Submits one selected status using a themed selector. */
export default function StatusForm() {
  return (
    <Form action="/api/example" method="post">
      <Selector name="status" label="Status" options={['open', 'closed']} defaultValue="open" required />
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

/** Shows a themed status selector with a resettable initial selection. */
export function SelectorExample() {
    // Selection submits one string and enforces a required choice.
    return <Selector name="status" label="Status" options={['open', 'closed']} defaultValue="open" required />;
}
