import { it, expect } from 'vitest';
import { legalPaths } from '@/platform/routes';

it('preserves the published legal document reading order', () => {
    // Assert
    expect(legalPaths).toEqual(['/terms', '/impressum', '/privacy']);
});
