// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { FileInput } from '@/components/ui/FileInput';

it('does not allow multiple attachments unless explicitly requested', () => {
    // Act
    const output = renderStatic(<FileInput label="Attachment" name="attachment" />);

    // Assert
    expect(output.querySelector('input[type="file"]')).not.toBeNull();
    expect(output.querySelector('input[type="file"]')?.hasAttribute('multiple')).toBe(false);
    expect(output.textContent).toContain('Choose file');
});
