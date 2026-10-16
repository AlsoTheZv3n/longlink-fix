import { it, expect } from 'vitest';
import { brandingPaths } from '@/platform/branding';

it('preserves the published branding URLs', () => {
    // Assert
    expect(brandingPaths).toEqual(['/branding/assets', '/branding/values', '/branding/comunication']);
});
