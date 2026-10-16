// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { JsxView } from '@/components/JsxView';
import { ApiErrorContext } from '@/lib/errors';

it('does not expose an executable frame before its runtime assets are verified', () => {
    // Act
    const output = renderStatic(
        <ApiErrorContext value={() => undefined}>
            <JsxView
                source="private source"
                params={{}}
                requestBaseUrl="/proxy/"
                navigationBaseUrl="/"
                runtime={{ version: 'a'.repeat(64) }}
            />
        </ApiErrorContext>
    );

    // Assert
    expect(output.querySelector('iframe')).toBeNull();
    expect(output.textContent).not.toContain('private source');
    expect(output.textContent).toContain('Preparing View');
});
