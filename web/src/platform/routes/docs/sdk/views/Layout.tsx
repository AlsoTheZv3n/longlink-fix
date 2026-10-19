import ViewLayout from './ViewLayout';
import { Text } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { Heading } from '@/components/ui/Heading';
import { Layout, LayoutContent, LayoutHeader, LayoutFooter, LayoutPanel } from '@/components/ui/Layout';

/** Documents Astryx-aligned layout regions available in Solution Views. */
export default function LayoutPage() {
    // Use an auto-height layout with a 280px supplementary panel; no narrow-screen swapping is applied.
    return (
        <ViewLayout
            name="Layout"
            isLongLinkSpecific
            properties={[
                {
                    name: 'children',
                    type: 'ReactNode',
                    description: 'Main content; shorthand for the content slot.',
                },
                {
                    name: 'content',
                    type: 'ReactNode',
                    description:
                        'Content slot (center). Accepts any ReactNode; use LayoutContent when a content region is needed. Children passed to `<Layout>` render here too: `<Layout>{main}</Layout>` is shorthand for `<Layout content={main} />`.',
                },
                {
                    name: 'header',
                    type: 'ReactNode',
                    description: 'Header slot. Accepts any ReactNode; use LayoutHeader when a header region is needed.',
                },
                {
                    name: 'footer',
                    type: 'ReactNode',
                    description: 'Footer slot. Accepts any ReactNode; use LayoutFooter when a footer region is needed.',
                },
                {
                    name: 'start',
                    type: 'ReactNode',
                    description:
                        'Logical-start slot (left in LTR). Accepts any ReactNode; use LayoutPanel when a panel region is needed.',
                },
                {
                    name: 'end',
                    type: 'ReactNode',
                    description:
                        'Logical-end slot (right in LTR). Accepts any ReactNode; use LayoutPanel when a panel region is needed.',
                },
                {
                    name: 'height',
                    type: '"fill" | "auto"',
                    description: 'Fill a bounded container or grow with content.',
                },
                {
                    name: 'contentWidth',
                    type: 'string | number',
                    description: 'Maximum aligned content width; numbers are pixels and strings are CSS sizes.',
                },
                {
                    name: 'padding',
                    type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
                    description:
                        "Insets this layout's regions using the spacing scale. Omit to retain Astryx's contextual padding.",
                },
                {
                    name: 'defaultHasDividers',
                    type: 'boolean',
                    description:
                        'Default for header and footer dividers; omitted values inherit the surrounding layout.',
                },
                {
                    name: 'LayoutContent.children',
                    type: 'ReactNode',
                },
                {
                    name: 'LayoutContent.padding',
                    type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
                },
                {
                    name: 'LayoutContent.isScrollable',
                    type: 'boolean',
                    description: 'Enables independent scrolling; defaults to true.',
                },
                {
                    name: 'LayoutContent.label',
                    type: 'string',
                    description: 'Accessible name for the region; distinguish repeated landmarks with labels.',
                },
                {
                    name: 'LayoutContent.role',
                    type: '"main" | "region"',
                },
                {
                    name: 'LayoutHeader.children',
                    type: 'ReactNode',
                },
                {
                    name: 'LayoutHeader.hasDivider',
                    type: 'boolean',
                    description: "Overrides the surrounding layout's divider default when provided.",
                },
                {
                    name: 'LayoutHeader.height',
                    type: 'string | number',
                    description: 'Header height; numbers are pixels and strings are CSS sizes.',
                },
                {
                    name: 'LayoutHeader.padding',
                    type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
                },
                {
                    name: 'LayoutHeader.paddingBlockEnd',
                    type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
                },
                {
                    name: 'LayoutHeader.label',
                    type: 'string',
                },
                {
                    name: 'LayoutHeader.role',
                    type: '"region" | "banner"',
                    description: 'Use banner only for a site-wide header, not a nested View section.',
                },
                {
                    name: 'LayoutFooter.children',
                    type: 'ReactNode',
                },
                {
                    name: 'LayoutFooter.hasDivider',
                    type: 'boolean',
                    description: "Overrides the surrounding layout's divider default when provided.",
                },
                {
                    name: 'LayoutFooter.height',
                    type: 'string | number',
                    description: 'Footer height; numbers are pixels and strings are CSS sizes.',
                },
                {
                    name: 'LayoutFooter.padding',
                    type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
                },
                {
                    name: 'LayoutFooter.label',
                    type: 'string',
                },
                {
                    name: 'LayoutFooter.role',
                    type: '"region" | "contentinfo"',
                    description: 'Use contentinfo only for a site-wide footer, not a nested View section.',
                },
                {
                    name: 'LayoutPanel.children',
                    type: 'ReactNode',
                },
                {
                    name: 'LayoutPanel.hasDivider',
                    type: 'boolean',
                },
                {
                    name: 'LayoutPanel.padding',
                    type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
                },
                {
                    name: 'LayoutPanel.isScrollable',
                    type: 'boolean',
                    description: 'Enables independent scrolling; defaults to true.',
                },
                {
                    name: 'LayoutPanel.label',
                    type: 'string',
                },
                {
                    name: 'LayoutPanel.role',
                    type: '"navigation" | "region" | "complementary"',
                },
                {
                    name: 'LayoutPanel.width',
                    type: 'string | number',
                    description: 'Panel width; numbers are pixels and strings are CSS sizes.',
                },
            ]}
            introduction="Use named regions for structured content. Fill layouts need a bounded container; auto layouts grow with content. Side panels keep their supplied widths and do not automatically stack."
            examples={[
                {
                    title: 'Content with a side panel',
                    preview: <LayoutExample />,
                    code: `function Example() {
  return (
    <Layout
      height="auto"
      defaultHasDividers
      header={<LayoutHeader><Heading level={3}>Email draft</Heading></LayoutHeader>}
      end={
        <LayoutPanel width={280} hasDivider role="complementary" label="About">
          <Stack gap={2}>
            <Heading level={4}>About</Heading>
            <Text>Research and contact information</Text>
          </Stack>
        </LayoutPanel>
      }
      footer={<LayoutFooter><Text color="secondary">Draft saved</Text></LayoutFooter>}
    >
      <LayoutContent>
        <Text>Write your message here.</Text>
      </LayoutContent>
    </Layout>
  );
}`,
                },
            ]}
        />
    );
}

/** Renders the layout example for documentation and the component catalog. */
export function LayoutExample() {
    // Keep the header and footer separate from the flexible content and fixed-width details panel.
    return (
        <Layout
            height="auto"
            defaultHasDividers
            header={
                <LayoutHeader>
                    <Heading level={3}>Email draft</Heading>
                </LayoutHeader>
            }
            end={
                <LayoutPanel width={280} hasDivider role="complementary" label="About">
                    <Stack gap={2}>
                        <Heading level={4}>About</Heading>
                        <Text>Research and contact information</Text>
                    </Stack>
                </LayoutPanel>
            }
            footer={
                <LayoutFooter>
                    <Text color="secondary">Draft saved</Text>
                </LayoutFooter>
            }
        >
            <LayoutContent>
                <Text>Write your message here.</Text>
            </LayoutContent>
        </Layout>
    );
}
