// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { WelcomeTitle } from '@/components/WelcomeTitle';

it('keeps the authentication greeting and named wordmark together', () => {
    // Act
    const output = renderStatic(<WelcomeTitle />);

    // Assert
    expect(output.textContent).toContain('Welcome to');
    expect(output.querySelector('img')?.getAttribute('alt')).toBe('LongLink');
});
