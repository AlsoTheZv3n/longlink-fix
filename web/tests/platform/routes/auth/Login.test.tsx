// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/auth/Login';

it('keeps password entry masked and email drafts in their owned field', () => {
    // Act
    const output = renderPlatform(<Page />, '/login?email=owner%40example.com');

    // Assert
    expect(output.querySelector('input[name="email"]')?.getAttribute('value')).toBe('owner@example.com');
    expect(output.querySelector('input[name="password"]')?.getAttribute('type')).toBe('password');
});
