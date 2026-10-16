// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Switch } from '@/components/ui/Switch';

it('preserves native submission for a checked switch', () => {
    // Act
    const output = renderStatic(<Switch name="enabled" label="Enabled" defaultChecked />);

    // Assert
    expect(output.querySelector('input')?.getAttribute('name')).toBe('enabled');
    expect(output.querySelector('input')?.hasAttribute('checked')).toBe(true);
});
