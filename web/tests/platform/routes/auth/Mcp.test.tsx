// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import Page from '@/platform/routes/auth/Mcp';
import { renderPlatform, user } from '../../render';

it('withholds approval actions until the server has validated the consent request', () => {
    // Act
    const output = renderPlatform(<Page />, '/mcp/authorize', [['/api/v1/me', user]]);

    // Assert
    expect(output.querySelector('h1')?.textContent).toBe('Authorize MCP access');
    expect(output.textContent).toContain('Loading authorization request');
    expect(output.textContent).not.toContain('Allow access');
});
