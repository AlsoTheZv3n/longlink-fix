// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import Layout from '@/platform/layouts/Legal';

it('keeps legal and brand references in their public navigation', () => {
    // Act
    const output = renderStatic(<Layout />, '/privacy');

    // Assert
    const navigation = output.querySelector('[aria-label="Legal and branding navigation"]');
    expect(navigation?.querySelector('a[href="/privacy/"]')).not.toBeNull();
    expect(navigation?.querySelector('a[href="/branding/assets"]')).not.toBeNull();
});
