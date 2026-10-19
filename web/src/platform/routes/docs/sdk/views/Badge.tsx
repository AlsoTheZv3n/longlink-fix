import ViewLayout from './ViewLayout';
import { Badge } from '@/components/ui/Badge';

/** Documents Badge in LongLink Views. */
export default function BadgePage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="Badge"
            introduction={'Displays a count or enumerated state.'}
            properties={[
                {
                    name: 'label',
                    type: 'ReactNode',
                    description:
                        "Badge text content. A badge is one line, so a label wider than the space available is cut with an ellipsis rather than escaping its container; a string or number label is also set as the badge's title so the full text stays reachable on hover.",
                },
                {
                    name: 'icon',
                    type: 'StoneIconName',
                    description: 'Optional leading icon.',
                },
                {
                    name: 'variant',
                    type: '"success" | "error" | "warning" | "info" | "neutral"',
                    description: 'Semantic variants (neutral, info, success, warning, error) use solid backgrounds.',
                },
            ]}
            examples={[
                {
                    title: 'Badge',
                    preview: <BadgeExample />,
                    code: `function Example() {
  return <Badge label="Open" variant="info" />;
}`,
                },
            ]}
        />
    );
}

/** Renders the page's badge example for documentation and the catalog. */
export function BadgeExample() {
    // Display the sample order state.
    return <Badge label="Open" variant="info" />;
}
