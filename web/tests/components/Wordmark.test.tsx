// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { Wordmark } from '@/components/Wordmark';

it('selects the artwork for the surrounding dark theme', () => {
    // Act
    const output = renderStatic(<Wordmark />);

    // Assert
    expect(output.querySelector('img')?.getAttribute('src')).toBe('/images/longlink-wordmark-dark.png');
    expect(output.querySelector('img')?.getAttribute('alt')).toBe('LongLink');
});
