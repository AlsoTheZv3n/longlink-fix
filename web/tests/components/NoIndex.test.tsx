// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { NoIndex } from '@/components/NoIndex';

it('keeps private pages out of search without publishing a canonical URL', () => {
    // Act
    const output = renderStatic(<NoIndex title="Account | LongLink" />);

    // Assert
    expect(output.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
    expect(output.querySelector('link[rel="canonical"]')).toBeNull();
});
