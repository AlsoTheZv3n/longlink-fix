// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { ClaudeAI } from '@/components/ClaudeAI';

it('preserves caller-supplied accessible branding', () => {
    // Act
    const output = renderStatic(<ClaudeAI aria-label="Claude" role="img" />);

    // Assert
    expect(output.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Claude');
    expect(output.querySelector('path')?.getAttribute('fill')).toBe('#D97757');
});
