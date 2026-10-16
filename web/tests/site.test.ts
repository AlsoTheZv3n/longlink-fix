import { it, expect } from 'vitest';
import { siteName, siteUrl } from '@/site';

it('publishes a normalized HTTP origin for site metadata', () => {
    // Assert
    expect(siteName).toBe('LongLink');
    expect(new URL(siteUrl).origin).toBe(siteUrl);
    expect(['http:', 'https:']).toContain(new URL(siteUrl).protocol);
});
