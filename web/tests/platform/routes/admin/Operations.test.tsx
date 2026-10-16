// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../../render';
import Page from '@/platform/routes/admin/Operations';
import { zOperationResponse } from '@/lib/generated/platform-api-v1/zod.gen';

it('keeps unfinished resource history readable without a resolved resource name', () => {
    // Arrange
    const operation = zOperationResponse.parse({
        id: '00000000-0000-4000-8000-000000000003',
        kind: 'solution.deploy',
        target_id: '00000000-0000-4000-8000-000000000004',
        resource_name: null,
        status: 'scheduled',
        failed: null,
        created_at: '2026-10-16T12:00:00Z',
        finished_at: null,
    });

    // Act
    const output = renderPlatform(<Page />, '/admin/operations', [
        ['/api/v1/operations?page=1&page_size=25&search=', { items: [operation], total: 1 }],
    ]);

    // Assert
    expect(output.textContent).toContain('Solution deployment');
    expect(output.textContent).toContain('Planned');
    expect(output.textContent).toContain('Resource unavailable');
});
