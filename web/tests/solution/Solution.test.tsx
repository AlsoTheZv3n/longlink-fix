import { it, expect } from 'vitest';
import { meta } from '@/solution/Solution';

it('does not duplicate root metadata after the runtime owns its page title', () => {
    // Assert
    expect(meta()).toEqual([]);
});
