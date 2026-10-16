// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Stepper, Step } from '@/components/ui/Stepper';

it('preserves the authored process step labels', () => {
    // Act
    const output = renderStatic(
        <Stepper activeStep={1}>
            <Step step={0} label="Review" />
            <Step step={1} label="Deploy" />
        </Stepper>
    );

    // Assert
    expect(output.textContent).toContain('Review');
    expect(output.textContent).toContain('Deploy');
});
