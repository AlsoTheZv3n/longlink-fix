// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { withMounted } from '../../../render';
import CreateOrganization from '@/platform/routes/user/CreateOrganization';

it('keeps creation disabled until a nonblank Organization name is supplied', async () => {
    // Act
    await withMounted(<CreateOrganization onClose={() => undefined} invalidate={async () => undefined} />, async () => {
        const dialog = document.querySelector('dialog');

        // Assert
        expect(dialog?.textContent).toContain('New organization');
        expect(dialog?.querySelector('button[type="submit"]')?.hasAttribute('disabled')).toBe(true);
    });
});
