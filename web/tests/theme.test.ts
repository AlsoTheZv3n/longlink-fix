import { it, expect } from 'vitest';
import { stoneTheme } from '@/theme';

it('keeps bundled action glyphs in the theme contract', () => {
    // Assert
    expect(stoneTheme).toMatchObject({ name: 'stone' });
    expect(stoneTheme.icons).toHaveProperty('search');
    expect(stoneTheme.icons).toHaveProperty('trash');
});
