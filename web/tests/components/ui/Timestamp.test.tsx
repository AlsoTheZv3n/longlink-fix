// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Timestamp } from '@/components/ui/Timestamp';

it('retains hidden timestamps for later redisplay', () => {
    // Act
    const output = renderStatic(<Timestamp value="2026-10-16T12:00:00Z" format="date" hidden />);
    const visible = renderStatic(<Timestamp value="2026-10-16T12:00:00Z" format="date" />);

    // Assert
    expect(output.querySelector('.hidden\\!')).not.toBeNull();
    expect(visible.textContent).not.toBe('');
    expect(output.textContent).toBe(visible.textContent);
});
