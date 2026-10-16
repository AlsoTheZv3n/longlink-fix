// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import { ApiBoundary } from '@/components/ApiBoundary';
import Page from '@/platform/routes/auth/ResetPassword';

it('does not expose password editing before reset proof has been verified', () => {
    // Act
    const output = renderPlatform(
        <ApiBoundary>
            <Page />
        </ApiBoundary>,
        '/auth/reset-password'
    );

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Set a new password');
    expect(output.querySelector('input[type="password"]')).toBeNull();
});
