// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import Brand from '@/platform/layouts/Brand';

it('retains supplied authentication content and an external documentation action', () => {
    // Act
    const output = renderStatic(<Brand>Sign-in form</Brand>);

    // Assert
    expect(output.textContent).toContain('Sign-in form');
    expect(output.querySelector('a[href="/docs/"]')?.getAttribute('target')).toBe('_blank');
});

it('keeps private pages out of search without publishing a canonical URL', () => {
    // Act
    const output = renderStatic(
        <Brand>
            <title>Account | LongLink</title>
        </Brand>
    );

    // Assert
    expect(output.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(output.querySelector('link[rel="canonical"]')).toBeNull();
});
