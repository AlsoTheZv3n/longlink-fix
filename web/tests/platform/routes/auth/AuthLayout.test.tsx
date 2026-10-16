// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../../render';
import { AuthLayout } from '@/platform/routes/auth/AuthLayout';

it('does not invent description content for explicitly empty authentication layouts', () => {
    // Act
    const output = renderStatic(
        <AuthLayout title="Sign in" description={null}>
            Credentials
        </AuthLayout>
    );

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Sign in');
    expect(output.querySelector('p')).toBeNull();
    expect(output.textContent).toContain('Credentials');
});
