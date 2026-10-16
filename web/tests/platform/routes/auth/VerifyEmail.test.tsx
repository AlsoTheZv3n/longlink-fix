// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/auth/VerifyEmail';
import { ApiBoundary } from '@/components/ApiBoundary';

it('does not expose account credential entry before email proof is verified', () => {
    // Act
    const output = renderPlatform(
        <ApiBoundary>
            <Page />
        </ApiBoundary>,
        '/auth/verify-email'
    );

    // Assert
    expect(output.querySelector('input[name="password"]')).toBeNull();
    expect(output.querySelector('input[name="name"]')).toBeNull();
    expect(output.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow');
});
