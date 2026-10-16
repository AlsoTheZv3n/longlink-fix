import catalog from '@/lib/catalog';
import { it, expect } from 'vitest';

it('publishes component references without CLI-only guidance', () => {
    // Assert
    expect(catalog.find((entry) => entry.name === 'Form')).toBeDefined();
    expect(catalog.every((entry) => !Object.hasOwn(entry, 'keywords') && !Object.hasOwn(entry, 'guidance'))).toBe(true);
});
