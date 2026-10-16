// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/auth/Register';

it('preserves a supplied email when linking back to sign in', () => {
    // Act
    const output = renderPlatform(<Page />, '/auth/register?email=owner%40example.com');

    // Assert
    expect(output.querySelector('input[name="email"]')?.getAttribute('value')).toBe('owner@example.com');
    expect(output.querySelector('a[href="/login?email=owner%40example.com"]')).not.toBeNull();
});
