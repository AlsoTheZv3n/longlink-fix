import { it, expect } from 'vitest';
import { useCasePages, useCasePaths } from '@/platform/usecases';

it('keeps the showcased screening process within the use-case collection', () => {
    // Assert
    expect(useCasePaths[0]).toBe('/use-cases');
    expect(useCasePages[0].path).toBe('/use-cases/real-estate/property-acquisition-screening');
    expect(new Set(useCasePaths).size).toBe(useCasePaths.length);
});
