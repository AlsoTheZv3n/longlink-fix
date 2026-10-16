import ts from 'typescript';
import { it, expect } from 'vitest';
import routes from '@/platform/routes';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

it('keeps authenticated and public route branches distinct', () => {
    // Assert
    expect(routes).toEqual(expect.arrayContaining([expect.objectContaining({ file: './layouts/Authenticated.tsx' })]));
    expect(routes).toEqual(expect.arrayContaining([expect.objectContaining({ file: './layouts/Brand.tsx' })]));
});

it('maps each handwritten runtime module to exactly one test file', () => {
    // Arrange
    const root = fileURLToPath(new URL('../..', import.meta.url));
    const source = join(root, 'src');
    const tests = join(root, 'tests');
    const expected: string[] = [];
    const actual: string[] = [];

    // Act
    for (const entry of readdirSync(source, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name) || entry.name.endsWith('.d.ts')) continue;
        const path = join(entry.parentPath, entry.name);
        const name = relative(source, path);

        if (name.startsWith(join('lib', 'generated') + '/')) continue;

        const result = ts.transpileModule(readFileSync(path, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.ESNext, removeComments: true, jsx: ts.JsxEmit.ReactJSX },
        });

        if (/^(?:export\s*\{\s*\};?)?\s*$/.test(result.outputText)) continue;
        expected.push(join(dirname(name), entry.name.replace(/\.tsx?$/, '')));
    }

    for (const entry of readdirSync(tests, { recursive: true, withFileTypes: true })) {
        if (entry.isFile() && /\.test\.tsx?$/.test(entry.name))
            actual.push(relative(tests, join(entry.parentPath, entry.name)).replace(/\.test\.tsx?$/, ''));
    }

    // Assert
    expect(actual.sort()).toEqual(expected.sort());
});
