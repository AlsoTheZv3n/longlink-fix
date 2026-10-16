// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderPlatform } from '../render';
import { DeletionDialog } from '@/platform/components/Deletion';

it('does not invent a confirmation or action when no resource is selected', () => {
    // Act
    const output = renderPlatform(<DeletionDialog confirmation={null} onClose={() => undefined} />);

    // Assert
    expect(output.querySelector('[role="alertdialog"]')).toBeNull();
    expect(output.textContent).toBe('');
});
