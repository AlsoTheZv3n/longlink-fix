// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { OpenAI } from '@/components/OpenAI';

it('inherits text color without losing its accessible label', () => {
    // Act
    const output = renderStatic(<OpenAI aria-label="OpenAI" role="img" />);

    // Assert
    expect(output.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('OpenAI');
    expect(output.querySelector('path')?.getAttribute('fill')).toBe('currentColor');
});
