import { siteUrl } from '@/site';
// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Seo } from '@/platform/components/Seo';

it('normalizes canonical paths and escapes authored structured data', () => {
    // Act
    const output = renderStatic(
        <Seo
            title="Orders"
            description="Order process"
            structuredData={{ name: '</script><script>unsafe</script>' }}
        />,
        '/docs/orders?search=secret'
    );

    // Assert
    expect(output.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${siteUrl}/docs/orders/`);
    expect(output.querySelector('script')?.textContent).not.toContain('<');
    expect(output.querySelector('script')?.textContent).toContain('\\u003c');
});
