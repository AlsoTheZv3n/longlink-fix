import type { ReactNode } from 'react';
import { Code } from '@astryxdesign/core/Code';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Heading';
import { CodeBlock } from '@astryxdesign/core/CodeBlock';
import { Blockquote } from '@astryxdesign/core/Blockquote';
import { DocumentationArticle } from '@/components/Article';
import { documentationLastUpdated } from '@/lib/documentation';
import { Table, proportional } from '@astryxdesign/core/Table';
import { componentCatalog, componentDocumentation } from '@/platform/routes';

type ViewProperty = NonNullable<(typeof componentCatalog)[number]['properties']>[number];

type ViewExample = { title: string; code: string; preview: ReactNode };

/** Provides examples and property references for an independently authored View page. */
export default function ViewLayout({
    name,
    introduction: authoredIntroduction,
    examples = [],
    children,
    toc,
}: {
    name: string;
    introduction?: string;
    examples?: ViewExample[];
    children?: ReactNode;
    toc?: { id: string; label: string; level: number }[];
}) {
    // Resolve the declaration catalog and optional authored introduction for this explicit page.
    const component = componentDocumentation.find((entry) => entry.name === name);

    if (!component) throw new Error(`Missing View documentation: ${name}`);
    const introduction = authoredIntroduction ?? component.introduction;
    const runtime = component.category === 'Runtime';

    // Prepare property tables below the examples.
    const groups = new Map<string, ViewProperty[]>();

    if (!runtime) {
        // Include grouped JSX children and the Buttons companion in the generated tables.
        const entries =
            name === 'Button'
                ? [component, ...componentCatalog.filter((entry) => entry.name === 'ButtonGroup')]
                : [component];

        for (const entry of entries) {
            for (const property of entry.properties ?? []) {
                const separator = property.name.indexOf('.');
                const group = separator < 0 ? entry.name : property.name.slice(0, separator);

                const row = {
                    ...property,
                    name: separator < 0 ? property.name : property.name.slice(separator + 1),
                };

                const properties = groups.get(group);

                if (properties) properties.push(row);
                else groups.set(group, [row]);
            }
        }
    }

    // Preserve the existing documentation shell, region sizes, and table of contents.
    const article = {
        description: introduction,
        lastUpdated: documentationLastUpdated,
        editUrl: `https://github.com/xLongLink/longlink/edit/main/web/src/platform/routes/docs/sdk/views/${component.label.replaceAll(' ', '')}.tsx`,
        title: `${component.label} | LongLink Documentation`,
        toc: [
            { id: 'introduction', label: 'Introduction', level: 1 },
            ...(toc ??
                (runtime
                    ? [{ id: 'reference', label: 'Reference', level: 2 }]
                    : [
                          { id: 'component-examples', label: 'Examples', level: 2 },
                          { id: 'component-properties', label: 'Properties', level: 2 },
                      ])),
        ],
    };

    // Render examples followed by the property reference in the same article.
    return (
        <DocumentationArticle article={article}>
            <Stack gap={5}>
                <Heading id="introduction" level={1}>
                    {component.label}
                </Heading>
                <Blockquote className="border-s-(--color-text-orange) text-(--color-text-orange)">
                    <Stack gap={0}>
                        <Text type="inherit">Beta notice: This page is being built.</Text>
                        <Link color="inherit" href={article.editUrl} hasUnderline isExternalLink type="inherit">
                            Edit on GitHub
                        </Link>
                    </Stack>
                </Blockquote>
                <Text as="p">{introduction}</Text>
                {authoredIntroduction !== undefined && !runtime && (
                    <Text as="p">This is a LongLink-specific component.</Text>
                )}
                <CodeBlock
                    code={`longlink docs component "${name}"`}
                    language="bash"
                    hasLanguageLabel={false}
                    isWrapped
                />
                {runtime ? (
                    children
                ) : (
                    <Stack gap={5}>
                        <Stack as="section" gap={5} aria-labelledby="component-examples">
                            <Heading id="component-examples" level={2}>
                                Examples
                            </Heading>
                            {examples.map((example) => (
                                <Stack key={example.title} gap={3}>
                                    <Stack
                                        padding={4}
                                        className="overflow-auto rounded-lg border border-border"
                                        aria-label={`${example.title} preview`}
                                    >
                                        {example.preview}
                                    </Stack>
                                    <CodeBlock code={example.code} language="jsx" hasLanguageLabel={false} />
                                </Stack>
                            ))}
                            {!examples.length && (
                                <Text as="p">No standalone examples are available for this component.</Text>
                            )}
                        </Stack>
                        <Stack as="section" gap={5} aria-labelledby="component-properties">
                            <Heading id="component-properties" level={2}>
                                Properties
                            </Heading>
                            {[...groups].map(([name, properties]) => (
                                <Stack key={name} gap={3}>
                                    {name && <Heading level={3}>{name}</Heading>}
                                    <Table
                                        data={properties}
                                        idKey="name"
                                        density="compact"
                                        columns={[
                                            {
                                                key: 'name',
                                                header: 'Property',
                                                width: proportional(1),
                                                renderCell: (property) => (
                                                    <Stack gap={0}>
                                                        <Stack direction="horizontal" align="center" gap={2}>
                                                            <Text>{property.name}</Text>
                                                            <Code className="text-sm">{property.type}</Code>
                                                        </Stack>
                                                        <Text type="supporting">{property.description}</Text>
                                                    </Stack>
                                                ),
                                            },
                                        ]}
                                    />
                                </Stack>
                            ))}
                        </Stack>
                    </Stack>
                )}
            </Stack>
        </DocumentationArticle>
    );
}
