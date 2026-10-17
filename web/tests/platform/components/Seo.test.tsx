import { siteUrl } from '@/site';
// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Seo } from '@/platform/components/Seo';

it('normalizes canonical paths and escapes authored structured data', () => {
    // Arrange
    const structuredData = { name: '</script><script>unsafe</script>' };

    // Act
    const output = renderStatic(
        <Seo title="Orders" description="Order process" structuredData={structuredData} />,
        '/docs/orders?search=secret'
    );

    // Assert
    expect(output.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${siteUrl}/docs/orders/`);

    // Require intact authored JSON while preventing literal HTML injection.
    const script = output.querySelector('script[type="application/ld+json"]');

    if (!script) throw new Error('Expected structured data');

    expect(script.textContent).not.toContain('<');
    expect(JSON.parse(script.textContent ?? '')).toEqual(structuredData);
});
