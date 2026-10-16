// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { TextArea } from '@/components/ui/TextArea';

it('retains multiline content under its native submission name', () => {
    // Act
    const output = renderStatic(<TextArea label="Notes" name="notes" defaultValue={'First\nSecond'} />);

    // Assert
    expect(output.querySelector('textarea[name="notes"]')?.textContent).toBe('First\nSecond');
    expect(output.querySelector('textarea')?.getAttribute('rows')).toBe('3');
});
