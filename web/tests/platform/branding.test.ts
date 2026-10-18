import { it, expect } from 'vitest';
import { brandingPaths } from '@/platform/routes';

it('preserves the published branding URLs', () => {
    // Assert
    expect(brandingPaths).toEqual(['/branding/assets', '/branding/values', '/branding/comunication']);
});
