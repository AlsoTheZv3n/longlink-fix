// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Timestamp } from '@/components/ui/Timestamp';

it('formats a timestamp as a date', () => {
    // Act
    const output = renderStatic(<Timestamp value="2026-10-16T12:00:00Z" format="date" />);

    // Assert
    expect(output.textContent).not.toBe('');
});
