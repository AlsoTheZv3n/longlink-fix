import { it, expect } from 'vitest';
import { adminNavigation, userNavigation } from '@/platform/navigation';

it('keeps administrator destinations out of the ordinary account navigation', () => {
    // Assert
    expect(adminNavigation.map((item) => item.href)).toContain('/admin/users');
    expect(userNavigation.map((item) => item.href)).toEqual(['/user/organizations', '/user/settings']);
});
