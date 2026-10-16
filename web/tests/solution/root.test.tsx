import { it, expect } from 'vitest';
import { meta } from '@/solution/root';

it('keeps the embedded Solution fallback out of search indexing', () => {
    // Assert
    expect(meta()).toContainEqual({ name: 'robots', content: 'noindex, nofollow' });
});
