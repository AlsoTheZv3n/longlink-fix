import path from 'node:path';
import ts from 'typescript';
import { z } from 'zod';
import * as yaml from 'yaml';
import * as prettier from 'prettier';
import * as astryx from '@astryxdesign/cli/api';
import { readFile, writeFile } from 'node:fs/promises';
import { documentationCategories } from '../src/lib/documentation.ts';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(root, '../sdk/longlink/.static/jsx/frontend.d.ts');
const template = path.join(import.meta.dirname, 'frontend.d.ts');
const authored = await readFile(template, 'utf8');

// Keep authored discovery intent beside the packaged catalog, independent of upstream UI APIs.
const discovery = z
    .object({
        groups: z.record(z.string(), z.string().trim().min(1)),
        components: z.record(
            z.string(),
            z.object({
                keywords: z.array(z.string().trim().min(1)),
                guidance: z.string().trim().min(1).optional(),
                introduction: z.string().trim().min(1).optional(),
            }),
        ),
        patterns: z.array(
            z.object({
                name: z.string().trim().min(1),
                description: z.string().trim().min(1),
                keywords: z.array(z.string().trim().min(1)).min(1),
                components: z.array(z.string().trim().min(1)).min(1),
                steps: z.array(z.string().trim().min(1)).min(1),
            }),
        ),
    })
    .parse(yaml.parse(await readFile(path.resolve(root, '../sdk/longlink/.static/jsx/discovery.yml'), 'utf8')));

// Resolve exported signatures, including re-exported helpers, from the runtime's TypeScript program.
const runtimeConfig = ts.readConfigFile(path.join(root, 'tsconfig.app.json'), ts.sys.readFile);
if (runtimeConfig.error) throw new Error(ts.flattenDiagnosticMessageText(runtimeConfig.error.messageText, '\n'));
const runtimeOptions = ts.parseJsonConfigFileContent(runtimeConfig.config, ts.sys, root).options;
const runtimeProgram = ts.createProgram([path.join(root, 'src/views/components.ts')], runtimeOptions);
const bindings = runtimeProgram.getSourceFile(path.join(root, 'src/views/components.ts'));
if (!bindings) throw new Error('Missing runtime component bindings: src/views/components.ts');

const editor = ts.createSourceFile(template, authored, ts.ScriptTarget.Latest, true);
const componentMetadata = new Map();
const componentDeclarations = [];
const supportDeclarations = [];
const propAliases = new Set(['ButtonProps', 'DateInputProps', 'CardProps']);
const runtimeChecker = runtimeProgram.getTypeChecker();
const printer = ts.createPrinter();
const spacing = editor.statements.find(
    (statement) => ts.isTypeAliasDeclaration(statement) && statement.name.text === 'Spacing',
);

/** Translates runtime support types to the standalone editor's existing aliases. */
function editorType(text) {
    return text
        .replaceAll('ReactNode', 'ViewNode')
        .replace(/MouseEvent<(HTMLButtonElement|HTMLElement)>/g, 'ViewMouseEvent')
        .replaceAll('ProportionalWidth', "Extract<ColumnWidth, { type: 'proportional' }>")
        .replaceAll('PixelWidth', "Extract<ColumnWidth, { type: 'pixel' }>");
}

// Generate editor suggestions from the complete public icon type, including Lucide's on-demand catalog.
const icons = runtimeProgram.getSourceFile(path.join(root, 'src/components/ui/Icon.tsx'));
if (!icons) throw new Error('Missing runtime icon source: src/components/ui/Icon.tsx');

const iconAlias = icons.statements.find(
    (statement) => ts.isTypeAliasDeclaration(statement) && statement.name.text === 'StoneIconName',
);
if (!iconAlias) throw new Error('Missing LongLink icon type');
const iconNames = runtimeProgram.getTypeChecker().getTypeFromTypeNode(iconAlias.type);
if (!iconNames.isUnion() || !iconNames.types.every((type) => type.isStringLiteral()))
    throw new Error('LongLink icon names must be a finite string union');
supportDeclarations.push(
    `/** Supported LongLink Lucide icon names, generated from the runtime registry. @ignore */\n` +
        `type StoneIconName = ${iconNames.types.map((type) => JSON.stringify(type.value)).join(' | ')};`,
);

for (const binding of bindings.statements) {
    if (!ts.isExportDeclaration(binding)) continue;
    if (binding.isTypeOnly) continue;
    if (!binding.moduleSpecifier || !binding.exportClause || !ts.isNamedExports(binding.exportClause))
        throw new Error('Public runtime bindings must use named exports');

    // Keep category and group identity beside the runtime exports, including grouped children and helpers.
    const tags = ts.getJSDocTags(binding);
    const category = tags.find((tag) => tag.tagName.text === 'category')?.comment;
    if (typeof category !== 'string' || !documentationCategories.includes(category))
        throw new Error(`Unknown documentation category: ${binding.getText(bindings)}`);
    const group = tags.find((tag) => tag.tagName.text === 'group')?.comment;
    if (group !== undefined && (typeof group !== 'string' || !group.trim()))
        throw new Error(`Invalid documentation group: ${binding.getText(bindings)}`);
    const overview = binding.jsDoc
        ?.map((comment) => comment.comment)
        .filter((comment) => typeof comment === 'string')
        .join(' ');

    for (const exported of binding.exportClause.elements) {
        if (exported.isTypeOnly) continue;
        const name = exported.name.text;

        // Resolve re-exported implementations too; an unsupported binding must fail rather than disappear.
        const symbol = runtimeChecker.getSymbolAtLocation(exported.name);
        if (!symbol) throw new Error(`Missing runtime export: ${name}`);
        const implementation = runtimeChecker.getAliasedSymbol(symbol).valueDeclaration;
        if (!implementation || !ts.isFunctionDeclaration(implementation))
            throw new Error(`Unsupported runtime component declaration: ${name}`);
        const wrapper = implementation.getSourceFile();
        const description = implementation.jsDoc
            ?.map((comment) => comment.comment)
            .filter((comment) => typeof comment === 'string')
            .join(' ');
        const parameter = implementation.parameters[0];
        const isComponent =
            category !== 'Runtime' &&
            parameter &&
            (parameter.name.getText(wrapper) === 'props' ||
                parameter.name.getText(wrapper) === '_props' ||
                ts.isObjectBindingPattern(parameter.name));

        // Read defaults from the wrapper rather than maintaining a separate documentation configuration.
        const defaults = new Map();
        if (parameter && ts.isObjectBindingPattern(parameter.name)) {
            for (const element of parameter.name.elements) {
                if (element.initializer)
                    defaults.set(
                        (element.propertyName ?? element.name).getText(wrapper),
                        literalDefault(element.initializer),
                    );
            }
        }

        /** Collects explicit prop fallbacks from the wrapper's rendered components. */
        function readDefaults(node) {
            // Sized controls retain inherited sizes before using their explicit fallback.
            if (
                ts.isVariableDeclaration(node) &&
                node.initializer &&
                ts.isCallExpression(node.initializer) &&
                node.initializer.expression.getText(wrapper) === 'useSize'
            ) {
                defaults.set('size', literalDefault(node.initializer.arguments[1]));
            }

            // Only nullish fallbacks define a default without replacing caller-provided values.
            if (ts.isJsxAttribute(node) && node.initializer && ts.isJsxExpression(node.initializer)) {
                const expression = node.initializer.expression;
                if (
                    expression &&
                    ts.isBinaryExpression(expression) &&
                    expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
                )
                    defaults.set(node.name.getText(wrapper), literalDefault(expression.right));
            }
            ts.forEachChild(node, readDefaults);
        }
        readDefaults(implementation);

        // Derive both editor declarations and documentation from the resolved runtime export.
        componentMetadata.set(name, {
            name,
            category,
            group: group?.trim(),
            declaration: implementation,
            overview,
            introduction: description || undefined,
            properties: isComponent ? documentedProps(implementation, defaults) : undefined,
        });

        let props = parameter?.type;
        if (props && ts.isTypeReferenceNode(props)) {
            const symbol = runtimeChecker.getSymbolAtLocation(props.typeName);
            const declaration = symbol?.declarations?.find(ts.isTypeAliasDeclaration);
            if (declaration?.getSourceFile() === wrapper) props = declaration.type;
        }

        // Preserve existing public prop aliases while deriving every component signature from its implementation.
        const propText = editorType(props?.getText(wrapper) ?? '{}');
        const generics = implementation.typeParameters?.length
            ? `<${implementation.typeParameters.map((type) => type.getText(wrapper)).join(', ')}>`
            : '';
        const alias = propAliases.has(`${name}Props`) ? `${name}Props` : undefined;
        if (alias)
            supportDeclarations.push(`/** @category ${category} @group ${name} */\ntype ${alias} = ${propText};`);

        // Components keep the public JSX contract, including marker children whose implementations return null.
        let parameters;
        let returnType;
        if (isComponent) {
            parameters = `props: ${alias ?? propText}`;
            returnType = 'React.JSX.Element';
        } else {
            // Helpers retain their actual argument names, optional defaults, and explicit return contracts.
            parameters = implementation.parameters
                .map((parameter) => {
                    if (!parameter.type) throw new Error(`Missing runtime parameter type: ${name}`);
                    return `${parameter.dotDotDotToken ? '...' : ''}${parameter.name.getText(wrapper)}${
                        parameter.questionToken || parameter.initializer ? '?' : ''
                    }: ${editorType(parameter.type.getText(wrapper))}`;
                })
                .join(', ');
            if (!implementation.type) throw new Error(`Missing runtime return type: ${name}`);
            returnType = editorType(implementation.type.getText(wrapper));
        }
        componentDeclarations.push(
            `/** ${overview ? `${overview} ` : ''}@category ${category}${group ? ` @group ${group.trim()}` : ''} */\n` +
                `declare function ${name}${generics}(${parameters}): ${returnType};`,
        );
    }
}

// Keep the common field contract synchronized with the wrappers that consume it.
const fields = runtimeProgram.getSourceFile(path.join(root, 'src/components/ui/types.ts'));
if (!fields) throw new Error('Missing runtime field types: src/components/ui/types.ts');

const fieldType = fields.statements.find(
    (statement) => ts.isTypeAliasDeclaration(statement) && statement.name.text === 'FieldProps',
);
supportDeclarations.push(
    `/** Shared props for form controls. */\ntype FieldProps = ${fieldType.type.getText(fields)};`,
);

// Generate the complete editor artifact from authored support and resolved runtime declarations.
const source = await prettier.format(
    [
        '// Generated by longlink dev from the installed SDK. Do not edit this local copy.\n' +
            '// Editor declarations only. The shared frontend supplies these APIs at runtime.',
        authored,
        ...supportDeclarations,
        ...componentDeclarations,
    ].join('\n\n'),
    {
        parser: 'typescript',
        tabWidth: 4,
        printWidth: 120,
        singleQuote: true,
    },
);
const document = ts.createSourceFile(output, source, ts.ScriptTarget.Latest, true);

/** Hides omission from prop choices while preserving empty values in callback contracts. */
function documentedType(type) {
    // Work with TypeScript syntax so nullable values and nested callable types remain correct.
    const node = runtimeChecker.typeToTypeNode(type, undefined, ts.NodeBuilderFlags.NoTruncation);
    const result = ts.transform(node, [
        (context) => {
            /** Uses familiar React types and explicit spacing choices without hiding callback empty values. */
            function visit(node, preserveUndefined = false) {
                // Render wrapper React content and the supported spacing scale instead of editor-only aliases.
                if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
                    if (node.typeName.text === 'ViewNode') return ts.factory.createTypeReferenceNode('ReactNode');
                    if (node.typeName.text === 'MouseEvent')
                        return ts.factory.createTypeReferenceNode('ViewMouseEvent');
                    if (node.typeName.text === 'Spacing') return spacing.type;
                }

                // Keep the editor's public response alias instead of exposing Zod's inferred JSON type.
                if (
                    ts.isUnionTypeNode(node) &&
                    node.types.length === 2 &&
                    node.types.every(
                        (type) =>
                            ts.isTypeReferenceNode(type) &&
                            ts.isIdentifier(type.typeName) &&
                            ['Blob', 'JSONType'].includes(type.typeName.text),
                    )
                )
                    return ts.factory.createTypeReferenceNode('ViewData');

                // Omission is not a prop choice, but callbacks can genuinely emit an empty value.
                if (ts.isUnionTypeNode(node) && !preserveUndefined) {
                    const options = node.types.filter((option) => option.kind !== ts.SyntaxKind.UndefinedKeyword);
                    if (options.length === 1) return ts.visitNode(options[0], visit);
                    return ts.factory.updateUnionTypeNode(
                        node,
                        options.map((option) => ts.visitNode(option, visit)),
                    );
                }
                return ts.visitEachChild(
                    node,
                    (child) =>
                        visit(
                            child,
                            preserveUndefined || ts.isFunctionTypeNode(node) || ts.isConstructorTypeNode(node),
                        ),
                    context,
                );
            }
            return (node) => ts.visitNode(node, visit);
        },
    ]);
    const transformed = result.transformed[0];
    const text = printer.printNode(
        ts.EmitHint.Unspecified,
        ts.isParenthesizedTypeNode(transformed) ? transformed.type : transformed,
        editor,
    );
    result.dispose();
    return text.replace(/\s*\n\s*/g, ' ');
}

/** Reads inherited and variant-specific props from a resolved runtime component. */
function documentedProps(declaration, defaults) {
    const signature = runtimeChecker.getTypeAtLocation(declaration).getCallSignatures()[0];
    const parameter = signature?.getParameters()[0];
    if (!parameter) return undefined;
    const props = runtimeChecker.getTypeOfSymbolAtLocation(parameter, declaration);
    const variants = props.isUnion() ? props.types : [props];
    const properties = new Map();

    // Include variant-specific props as well as inherited fields and callable component props.
    for (const variant of variants) {
        for (const property of variant.getProperties()) {
            const type = documentedType(runtimeChecker.getTypeOfSymbolAtLocation(property, declaration));
            const existing = properties.get(property.name);
            if (existing) {
                existing.types.add(type);
                existing.required &&= !(property.flags & ts.SymbolFlags.Optional);
                existing.variants += 1;
            } else {
                properties.set(property.name, {
                    types: new Set([type]),
                    required: !(property.flags & ts.SymbolFlags.Optional),
                    variants: 1,
                    description: ts.displayPartsToString(property.getDocumentationComment(runtimeChecker)),
                });
            }
        }
    }
    return [...properties].map(([name, property]) => ({
        name,
        type: [...property.types].map((type) => (property.types.size > 1 ? `(${type})` : type)).join(' | '),
        required: property.required && property.variants === variants.length,
        default: defaults.get(name),
        description: property.description || undefined,
    }));
}

// Use TypeScript's parser rather than maintaining another markup or declaration parser.
if (document.parseDiagnostics.length) {
    throw new Error(ts.flattenDiagnosticMessageText(document.parseDiagnostics[0].messageText, '\n'));
}

// Runtime APIs retain their authored editor contracts; components come directly from runtime exports.
const runtimeAPIs = editor.statements
    .filter((statement) =>
        ts.getJSDocTags(statement).some((tag) => tag.tagName.text === 'category' && tag.comment === 'Runtime'),
    )
    .map((declaration) => ({ declaration }));

// Preserve member and property order within a group, and expose only the shared catalog contract.
const groups = new Map();
for (const metadata of [...runtimeAPIs, ...componentMetadata.values()]) {
    const statement = metadata.declaration;
    const declaration = ts.isVariableStatement(statement) ? statement.declarationList.declarations[0] : statement;
    if (!ts.isVariableDeclaration(declaration) && !ts.isFunctionDeclaration(declaration)) continue;

    // Authored runtime APIs and resolved component exports share the same catalog assembly.
    const tags = metadata.category ? [] : ts.getJSDocTags(statement);
    if (tags.some((tag) => tag.tagName.text === 'ignore')) continue;
    const name = metadata.name ?? declaration.name?.getText(statement.getSourceFile());
    if (!name) continue;
    const category = metadata.category ?? 'Runtime';
    const group = metadata.category ? metadata.group : tags.find((tag) => tag.tagName.text === 'group')?.comment;
    if (group !== undefined && (typeof group !== 'string' || !group.trim()))
        throw new Error(`Invalid documentation group: ${name}`);
    const properties = metadata.properties;
    const entry = {
        name: group?.trim() ?? name,
        category,
        ...(properties
            ? {
                  properties: properties.map((property) => ({
                      ...property,
                      name: group && group !== name ? `${name}.${property.name}` : property.name,
                  })),
              }
            : {}),
        ...(category === 'Runtime' && ts.isFunctionDeclaration(declaration)
            ? {
                  members: [
                      {
                          name: `${name}(${declaration.parameters.map((parameter) => parameter.name.getText(statement.getSourceFile())).join(', ')})`,
                          description: metadata.category
                              ? (metadata.overview ?? '')
                              : (statement.jsDoc
                                    ?.map((comment) => comment.comment)
                                    .filter((comment) => typeof comment === 'string')
                                    .join(' ') ?? ''),
                      },
                  ],
              }
            : {}),
    };
    const existing = groups.get(entry.name);
    if (existing) {
        if (existing.category !== entry.category)
            throw new Error(`Conflicting documentation categories: ${entry.name}`);
        if (entry.members) (existing.members ??= []).push(...entry.members);
        if (entry.properties) (existing.properties ??= []).push(...entry.properties);
    } else {
        groups.set(entry.name, entry);
    }
}
const components = [...groups.values()].sort((left, right) => left.name.localeCompare(right.name));

// Read the same authored component content used by the Astryx website, pinned to the installed library.
const componentDetails = new Map();

/** Reuses successful documentation lookups for the lifetime of this generation. */
async function componentDetail(name) {
    // Load each component or shared parent only once, preserving lookup failures.
    if (!componentDetails.has(name)) {
        const result = await astryx.component(name);
        componentDetails.set(name, result.data);
    }
    return componentDetails.get(name);
}

for (const entry of components) {
    if (
        entry.category === 'Runtime' ||
        ['Card', 'Currency', 'FileViewer', 'Form', 'FormStep', 'Image', 'Menu', 'Tabs'].includes(entry.name)
    )
        continue;
    const detail = await componentDetail(entry.name);
    const upstreamProps =
        detail.props ?? detail.components?.find((component) => component.name === entry.name)?.props ?? [];

    // Enrich exact public prop names without adding styling props or expanding grouped children.
    for (const property of entry.properties ?? []) {
        if (property.name === 'className' || property.name.includes('.')) continue;

        // Preserve authored metadata and inherit upstream defaults only for optional props.
        const upstream = upstreamProps.find((candidate) => candidate.name === property.name);
        property.description ??= upstream?.description ?? `The ${property.name} prop.`;
        if (property.default === undefined && !property.required) property.default = nativeDefault(upstream?.default);
    }

    entry.introduction =
        componentMetadata.get(entry.name)?.introduction ?? detail.usage?.description ?? detail.description;

    // Fetch parent usage only when no component-owned introduction or usage is available.
    const parentName = detail.subComponentOf ?? detail.parentDoc;
    if (entry.introduction == null && detail.usage == null && parentName) {
        const parent = await componentDetail(parentName);
        entry.introduction = parent.usage?.description;
    }
    entry.introduction ??= '';
}

// Keep inline default labels out of descriptions when a separate default is documented.
for (const entry of components) {
    for (const property of entry.properties ?? []) {
        if (property.default !== undefined)
            property.description = property.description?.replace(/\s+\(default\)/gi, '');

        // Describe named sizes without embedding their pixel dimensions.
        if (property.name === 'size')
            property.description = property.description?.replace(/\s*\([^)]*\d+(?:x\d+)?px[^)]*\)/g, '');
    }
}

/** Parses upstream default expressions without executing them. */
function nativeDefault(value) {
    if (value === undefined || value === '-') return undefined;

    // Parse the expression with the same TypeScript parser used for the declaration catalog.
    const document = ts.createSourceFile('default.ts', `(${value})`, ts.ScriptTarget.Latest, true);
    const statement = document.statements[0];
    if (document.parseDiagnostics.length || !statement || !ts.isExpressionStatement(statement)) return value;

    return literalDefault(statement.expression, value);
}

/** Reads native defaults directly from source expressions, preserving computed expression text. */
function literalDefault(expression, fallback = expression.getText()) {
    // Unwrap grouping while retaining the original text for computed defaults.
    while (ts.isParenthesizedExpression(expression)) expression = expression.expression;

    // Preserve scalar types and remove JavaScript string-literal quoting.
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
    if (ts.isNumericLiteral(expression)) return Number(expression.text);
    if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (expression.kind === ts.SyntaxKind.NullKeyword) return null;

    // Visit object members directly instead of parsing their source text again.
    if (
        ts.isObjectLiteralExpression(expression) &&
        expression.properties.every(
            (property) =>
                ts.isPropertyAssignment(property) &&
                (ts.isIdentifier(property.name) ||
                    ts.isStringLiteral(property.name) ||
                    ts.isNumericLiteral(property.name)),
        )
    )
        return Object.fromEntries(
            expression.properties.map((property) => [property.name.text, literalDefault(property.initializer)]),
        );
    return fallback;
}

// Validate authored discovery references against the actual public runtime surface.
const componentNames = new Set(components.map((component) => component.name));
for (const name of Object.keys(discovery.components)) {
    if (!componentNames.has(name)) throw new Error(`Unknown discovery component: ${name}`);
}
for (const category of documentationCategories) {
    if (!discovery.groups[category]) throw new Error(`Missing discovery group: ${category}`);
}
for (const pattern of discovery.patterns) {
    for (const name of pattern.components) {
        if (!componentNames.has(name))
            throw new Error(`Unknown component in discovery pattern ${pattern.name}: ${name}`);
    }
}

// Publish one validated JSON catalog for both the CLI and website.
const catalog = z
    .array(
        z.object({
            name: z.string(),
            category: z.string(),
            introduction: z.string(),
            keywords: z.array(z.string()).optional(),
            guidance: z.string().optional(),
            properties: z
                .array(
                    z.object({
                        name: z.string(),
                        type: z.string(),
                        description: z.string().optional(),
                        default: z.json().optional(),
                    }),
                )
                .optional(),
            members: z.array(z.object({ name: z.string(), description: z.string() })).optional(),
        }),
    )
    .parse(
        components.map(({ properties, ...component }) => ({
            ...component,
            introduction: component.introduction ?? '',
            ...discovery.components[component.name],
            ...(properties
                ? {
                      properties: properties.map(({ name, type, description, default: defaultValue }) => ({
                          name,
                          type,
                          description,
                          ...(defaultValue !== undefined ? { default: defaultValue } : {}),
                      })),
                  }
                : {}),
        })),
    );
const outputs = [
    { filename: output, text: source },
    {
        filename: path.resolve(root, '../sdk/longlink/.static/jsx/components.json'),
        text: `${JSON.stringify({ components: catalog, groups: discovery.groups, patterns: discovery.patterns }, null, 4)}\n`,
    },
];

// CLI and website documentation share one generated catalog; checking must not modify files.
for (const { filename, text } of outputs) {
    const current = await readFile(filename, 'utf8').catch((error) => {
        // Only a missing output is regenerable; surface permission and other I/O failures.
        if (error.code === 'ENOENT') return undefined;
        throw error;
    });
    if (current !== text) {
        if (process.argv.includes('--check')) {
            console.error(`Generated documentation is stale: ${filename}`);
            process.exitCode = 1;
        } else {
            await writeFile(filename, text, 'utf8');
        }
    }
}
