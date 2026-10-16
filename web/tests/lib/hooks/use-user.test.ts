import { it, expect } from 'vitest';
// @vitest-environment happy-dom
import { createElement } from 'react';
import { renderStatic } from '../../render';
import { useAuthenticatedUser } from '@/lib/hooks/use-user';

it('fails explicitly when used outside the authenticated route boundary', () => {
    // Arrange
    function Probe() {
        return useAuthenticatedUser().name;
    }

    // Act / Assert
    expect(() => renderStatic(createElement(Probe))).toThrow(
        'useAuthenticatedUser must be used within an authenticated route'
    );
});
