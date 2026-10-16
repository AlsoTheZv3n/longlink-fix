// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Selector } from '@/components/ui/Selector';

it('keeps a selected option available to native form submission', () => {
    // Act
    const output = renderStatic(
        <Selector label="Status" name="status" options={['open', 'closed']} defaultValue="open" />
    );

    // Assert
    expect(output.querySelector('input[name="status"]')?.getAttribute('value')).toBe('open');
});
