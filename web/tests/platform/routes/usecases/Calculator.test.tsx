// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../../render';
import Calculator from '@/platform/routes/usecases/Calculator';

it('calculates annual savings from the documented default assumptions', () => {
    // Act
    const output = renderStatic(<Calculator />);

    // Assert
    expect(output.textContent).toContain('300');
    expect(output.textContent).toContain('22,500');
});
