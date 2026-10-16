// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Button } from '@/components/ui/Button';
import { ButtonGroup } from '@/components/ui/ButtonGroup';

it('names the group while retaining its actions', () => {
    // Act
    const output = renderStatic(
        <ButtonGroup label="Order actions">
            <Button label="Save" />
        </ButtonGroup>
    );

    // Assert
    expect(output.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Order actions');
    expect(output.textContent).toContain('Save');
});
