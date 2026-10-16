// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/user/Settings';

it('loads the account draft without requesting inactive organization settings', () => {
    // Act
    const output = renderPlatform(<Page />, '/user/settings');

    // Assert
    expect(output.querySelector('input')?.getAttribute('value')).toBe('Owner');
    expect(output.textContent).toContain('owner@example.com');
});
