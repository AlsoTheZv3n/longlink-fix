import catalog from '@/lib/catalog';
import { it, expect } from 'vitest';
import { documentationCategories } from '@/lib/documentation';

it('places every published component in a documented reading category', () => {
    // Assert
    expect(new Set(catalog.map((entry) => entry.category))).toEqual(new Set(documentationCategories));
});
