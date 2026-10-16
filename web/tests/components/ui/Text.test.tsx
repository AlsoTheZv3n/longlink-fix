// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Text } from '@/components/ui/Text';

it('preserves requested paragraph semantics and hidden content', () => {
    // Act
    const output = renderStatic(
        <Text as="p" hidden>
            Private draft
        </Text>
    );

    // Assert
    expect(output.querySelector('p')?.textContent).toBe('Private draft');
    expect(output.querySelector('p')?.classList.contains('hidden!')).toBe(true);
});
