// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform, user } from '../render';
import { ProfileMenu } from '@/platform/components/Profile';

it('identifies the profile trigger without prematurely opening account actions', () => {
    // Act
    const output = renderPlatform(<ProfileMenu user={user} />);

    // Assert
    expect(output.querySelector('button')?.getAttribute('aria-label')).toBe('Owner');
    expect(output.textContent).not.toContain('Sign out');
});
