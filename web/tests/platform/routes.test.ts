import { it, expect } from 'vitest';
import routes from '@/platform/routes';

it('keeps authenticated and public route branches distinct', () => {
    // Assert
    expect(routes).toEqual(expect.arrayContaining([expect.objectContaining({ file: './layouts/Authenticated.tsx' })]));
    expect(routes).toEqual(expect.arrayContaining([expect.objectContaining({ file: './layouts/Brand.tsx' })]));
});
