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
