// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/auth/ForgotPassword';

it('requests an email before displaying password-reset confirmation', () => {
    // Act
    const output = renderPlatform(<Page />);

    // Assert
    expect(output.querySelector('input[name="email"]')?.getAttribute('type')).toBe('email');
    expect(output.textContent).toContain('Send reset email');
    expect(output.textContent).not.toContain('instructions are on the way');
});
