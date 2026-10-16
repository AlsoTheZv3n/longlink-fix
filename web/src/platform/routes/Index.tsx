import type { ReactNode } from 'react';
import { siteName, siteUrl } from '@/site';
import { Card } from '@astryxdesign/core/Card';
import { Grid } from '@astryxdesign/core/Grid';
import { Icon } from '@astryxdesign/core/Icon';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { Seo } from '@/platform/components/Seo';
import { Showcase } from '@/components/Showcase';
import { Stack } from '@astryxdesign/core/Stack';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Section } from '@astryxdesign/core/Section';
import { ArrowRight, Code2, Minimize2, ServerCog, ShieldCheck, Split } from 'lucide-react';

const homeDescription =
    'LongLink is the open-source foundation for building, deploying, and operating dedicated business software in Python.';

/** Renders a platform capability card. */
function CapabilityCard({ title, description, icon }: { title: string; description: ReactNode; icon: typeof Code2 }) {
    return (
        <Card className="rounded-none bg-transparent" minHeight={240} padding={6}>
            <Stack gap={8} height="100%" justify="between">
                <Icon color="tertiary" icon={icon} size="lg" />
                <Stack gap={3}>
                    <Heading className="font-(family-name:--font-family-handwritten) tracking-wide uppercase" level={2}>
                        {title}
                    </Heading>
                    <Text as="p" color="secondary" textWrap="pretty">
                        {description}
                    </Text>
                </Stack>
            </Stack>
        </Card>
    );
}

/** Renders the public home page. */
export default function Home() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                name: siteName,
                url: siteUrl,
                sameAs: ['https://github.com/xLongLink/longlink', 'https://www.linkedin.com/company/longlink'],
            },
            {
                '@type': 'WebSite',
                name: siteName,
                url: siteUrl,
                description: homeDescription,
            },
        ],
    };

    return (
        <>
            <Seo
                description={homeDescription}
                structuredData={structuredData}
                title="LongLink | Build and Operate business solutions"
            />
            <Stack as="main">
                <Section className="pt-16 sm:pt-24" paddingInline={6} paddingBlockEnd={10} variant="transparent">
                    <Stack className="mx-auto text-center" maxWidth={1000} width="100%" gap={6} hAlign="center">
                        <Text
                            as="p"
                            className="text-yellow-vivid"
                            justify="center"
                            textWrap="balance"
                            type="supporting"
                        >
                            Currently in testing Beta.{' '}
                            <Link
                                as="a"
                                color="inherit"
                                href="https://github.com/xLongLink/longlink"
                                hasUnderline
                                isExternalLink
                                type="inherit"
                            >
                                Star LongLink on GitHub.
                            </Link>
                        </Text>
                        <Heading
                            className="flex flex-wrap items-center justify-center gap-2 font-(family-name:--font-family-handwritten) text-3xl tracking-wide uppercase sm:text-5xl"
                            justify="center"
                            level={1}
                            textWrap="balance"
                            type="display-2"
                        >
                            <Text hasCapsize type="inherit">
                                Design
                            </Text>
                            <ArrowRight aria-hidden="true" className="size-6 shrink-0 sm:size-8" />
                            <Text hasCapsize type="inherit">
                                Build
                            </Text>
                            <ArrowRight aria-hidden="true" className="size-6 shrink-0 sm:size-8" />
                            <Text hasCapsize type="inherit">
                                Operate
                            </Text>
                            <ArrowRight aria-hidden="true" className="size-6 shrink-0 sm:size-8" />
                            <Text hasCapsize type="inherit">
                                Improve
                            </Text>
                        </Heading>
                        <Text as="p" className="text-lg sm:text-2xl" color="secondary" textWrap="pretty">
                            <Text display="block" type="inherit">
                                The complete business process lifecycle, defined as code
                            </Text>
                            <Text display="block" type="inherit">
                                One source of truth for how work gets done
                            </Text>
                        </Text>
                    </Stack>
                </Section>
                <Showcase />
                <Section variant="transparent" paddingInline={6} paddingBlock={10}>
                    <Stack className="mx-auto" maxWidth={1000} gap={4}>
                        <Heading
                            level={2}
                            justify="center"
                            textWrap="balance"
                            className="font-(family-name:--font-family-handwritten)"
                        >
                            Create the tools your business needs
                        </Heading>
                        <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
                            <CapabilityCard
                                description="Complete solutions using python and your favorite developer tools"
                                icon={Code2}
                                title="Build"
                            />
                            <CapabilityCard
                                description={
                                    <>
                                        All your solutions in one place,
                                        <br />
                                        with clear boundaries and a complete overview
                                    </>
                                }
                                icon={ServerCog}
                                title="Operate"
                            />
                        </Grid>
                        <Grid columns={{ minWidth: 240, max: 3 }} gap={4}>
                            <CapabilityCard
                                description="Processes are clear, easy to operate, and cheap to maintain"
                                icon={Minimize2}
                                title="Keep it Simple"
                            />
                            <CapabilityCard
                                description="Full transparency over the process and its data"
                                icon={ShieldCheck}
                                title="Own the Process"
                            />
                            <CapabilityCard
                                description="Clear distinction between a human decision and a machine task"
                                icon={Split}
                                title="Clear Boundaries"
                            />
                        </Grid>
                    </Stack>
                </Section>
                <Section padding={6} paddingBlock={10} variant="transparent">
                    <Stack
                        className="mx-auto text-center"
                        gap={6}
                        hAlign="center"
                        maxWidth={1000}
                        paddingBlock={8}
                        width="100%"
                    >
                        <Text aria-hidden="true" className="text-xl leading-none">
                            🇨🇭
                        </Text>
                        <Heading
                            className="font-(family-name:--font-family-handwritten) tracking-wide uppercase"
                            level={2}
                            textWrap="balance"
                            justify="center"
                        >
                            Made in Switzerland
                        </Heading>
                        <Grid columns={2} gap={3}>
                            <Button
                                className="w-full"
                                endContent={<ArrowRight aria-hidden="true" size={16} />}
                                href="/blog/why-longlink/"
                                label="Why LongLink"
                                variant="secondary"
                            />
                            <Button
                                className="w-full"
                                endContent={<ArrowRight aria-hidden="true" size={16} />}
                                href="/login/"
                                label="Get Started"
                                variant="primary"
                            />
                        </Grid>
                    </Stack>
                </Section>
            </Stack>
        </>
    );
}
