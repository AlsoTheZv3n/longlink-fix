// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { RadioList, RadioListItem } from '@/components/ui/RadioList';

it('maps the selected choice onto a native named radio group', () => {
    // Act
    const output = renderStatic(
        <RadioList label="Status" name="status" defaultValue="open">
            <RadioListItem label="Open" value="open" />
        </RadioList>
    );

    // Assert
    expect(output.querySelector('input[type="radio"]')?.getAttribute('name')).toBe('status');
    expect(output.querySelector('input[type="radio"]')?.hasAttribute('checked')).toBe(true);
});
