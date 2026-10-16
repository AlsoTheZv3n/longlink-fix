import { load } from '@/lib/icons';
import { it, expect } from 'vitest';
import { iconDataSchema } from '@/views/protocol';

it('returns transferable glyph data only for installed icon names', async () => {
    // Act
    const data = await load('search');

    // Assert
    expect(iconDataSchema.safeParse(data).success).toBe(true);
    await expect(load('__proto__')).rejects.toThrow('Unknown Lucide icon');
});
