// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { stoneIconRegistry } from '@/lib/glyphs';

it('keeps standard action aliases available as decorative SVGs', () => {
    // Act
    const output = renderStatic(stoneIconRegistry.trash);

    // Assert
    expect(output.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(output.querySelector('path')).not.toBeNull();
});
