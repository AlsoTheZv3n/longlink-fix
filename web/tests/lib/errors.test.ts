import { it, expect } from 'vitest';
import { ApiError } from '@/lib/api';
import { createErrorReporter } from '@/lib/errors';

it('reports the same failure only once across workflow boundaries', () => {
    // Arrange
    const messages: string[] = [];
    const report = createErrorReporter((message) => messages.push(message));
    const failure = new ApiError('Permission required', 403);

    // Act
    report(failure);
    report(failure);
    report(new DOMException('Canceled', 'AbortError'));

    // Assert
    expect(messages).toEqual(['Permission required']);
});
