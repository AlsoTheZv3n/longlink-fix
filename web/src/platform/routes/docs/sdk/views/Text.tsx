import ViewLayout from './ViewLayout';
import { Text } from '@/components/ui/Text';

/** Documents Text in LongLink Views. */
export default function TextPage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="Text"
            introduction={
                "Displays View text with Astryx's semantic typography, alignment, wrapping, and truncation controls."
            }
            properties={[
                {
                    name: 'children',
                    type: 'ReactNode',
                    description: 'Text content.',
                },
                {
                    name: 'color',
                    type: '"primary" | "secondary" | "disabled" | "placeholder" | "accent" | "inherit"',
                    description:
                        "Text color. Defaults to 'secondary' for the 'supporting' type, 'primary' for all others. Themes may add custom colors.",
                },
                {
                    name: 'type',
                    type: '"code" | "inherit" | "body" | "large" | "label" | "supporting" | "display-1" | "display-2" | "display-3"',
                    description:
                        "Semantic text type. Determines size, weight, and line-height from the theme. 'inherit' takes all three from the surrounding text instead. Themes may add custom types. Note: this prop is called `type`, not `variant`.",
                },
                {
                    name: 'size',
                    type: '"4xs" | "3xs" | "2xs" | "xsm" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl"',
                    description:
                        'Explicit font size override. Overrides the size from `type` but preserves other type properties. Prefer using `type` alone.',
                },
                {
                    name: 'weight',
                    type: '"bold" | "normal" | "medium" | "semibold"',
                    description: 'Font weight override.',
                },
                {
                    name: 'display',
                    type: '"inline" | "block"',
                    description:
                        "Display type. Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.",
                },
                {
                    name: 'as',
                    type: '"label" | "span" | "p" | "div" | "h1" | "h2" | "h3"',
                    description: 'HTML element to render.',
                },
                {
                    name: 'maxLines',
                    type: 'number',
                    description:
                        'Maximum lines before truncation. 0 means no truncation. When set, shows a tooltip on hover if content is truncated.',
                },
                {
                    name: 'hasTruncateTooltip',
                    type: 'boolean | "start" | "end" | "above" | "below"',
                    description:
                        "Controls tooltip behavior for truncated text. true shows the tooltip at the default position, false disables it, or a placement string ('above' | 'below' | 'start' | 'end') sets a specific position.",
                },
                {
                    name: 'wordBreak',
                    type: '"break-word" | "break-all"',
                    description:
                        "Word break behavior when truncating. Defaults to 'break-all' for single-line truncation, 'break-word' otherwise.",
                },
                {
                    name: 'textWrap',
                    type: '"nowrap" | "wrap" | "balance" | "pretty"',
                    description: 'Text wrapping behavior.',
                },
                {
                    name: 'justify',
                    type: '"start" | "center" | "end"',
                    description:
                        'Text alignment (justification). Uses logical values (start/end) for i18n/RTL compatibility.',
                },
                {
                    name: 'hasCapsize',
                    type: 'boolean',
                    description: 'Enable optical alignment using text-box-trim. Forces block display.',
                },
                {
                    name: 'hasStrikethrough',
                    type: 'boolean',
                    description: 'Apply strikethrough text decoration.',
                },
                {
                    name: 'hasTabularNumbers',
                    type: 'boolean',
                    description: 'Use tabular (monospace) numbers for aligned numeric data.',
                },
            ]}
            examples={[
                {
                    title: 'Text',
                    preview: <TextExample />,
                    code: `function Example() {
  return <Text>Order details</Text>;
}`,
                },
            ]}
        />
    );
}

/** Renders the page's text example for documentation and the catalog. */
export function TextExample() {
    // Show normal text alongside bold and italic emphasis.
    return (
        <Text>
            Normal <b>bold</b> and <i>italic</i> text.
        </Text>
    );
}
