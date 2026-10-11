import { describe, expect, it } from 'vitest';
import { commandSchema, messageSize, requestSchema } from '@/views/protocol';

describe('Solution request body admission', () => {
    it.each([{ method: 'GET' }, { method: 'POST', json: null }, { method: 'POST', form: [] }])(
        'accepts a valid request: %j',
        (request) => {
            // Arrange
            const command = { type: 'request', id: 0, path: '/items', ...request };

            // Act
            const parsed = commandSchema.parse(command);

            // Assert
            expect(parsed).toEqual(command);
        }
    );

    it.each([{ json: null }, { form: [] }])('rejects an explicit GET body: %j', (body) => {
        // Arrange
        const command = { type: 'request', id: 0, path: '/items', method: 'GET', ...body };

        // Act
        const result = commandSchema.safeParse(command);

        // Assert
        expect(result).toMatchObject({
            success: false,
            error: { issues: [{ path: ['method'], message: 'GET requests cannot send a body' }] },
        });
    });

    it('rejects simultaneous JSON and form bodies even when both are empty', () => {
        // Arrange
        const command = { type: 'request', id: 0, path: '/items', method: 'POST', json: null, form: [] };

        // Act
        const result = commandSchema.safeParse(command);

        // Assert
        expect(result).toMatchObject({
            success: false,
            error: { issues: [{ path: ['form'], message: 'Choose JSON or form data' }] },
        });
    });

    it.each([{ headers: { Authorization: 'Bearer attacker' } }, { credentials: 'include' }, { redirect: 'follow' }])(
        'rejects sandbox-supplied host fetch options: %j',
        (options) => {
            // Arrange
            const command = { type: 'request', id: 0, path: '/items', method: 'POST', ...options };

            // Act
            const result = commandSchema.safeParse(command);

            // Assert
            expect(result.success).toBe(false);
        }
    );

    it('counts UTF-8 JSON bytes when bounding sandbox requests', () => {
        // Arrange
        const command = requestSchema.parse({ type: 'request', id: 0, path: '/items', method: 'POST', json: 'é' });

        // Act
        const size = messageSize(command);

        // Assert
        expect(size).toBe(4);
    });

    it('counts UTF-8 field names and values together with binary form bytes', () => {
        // Arrange
        const command = requestSchema.parse({
            type: 'request',
            id: 0,
            path: '/items',
            method: 'POST',
            form: [
                ['é', '€'],
                ['file', new Blob(['abc'])],
            ],
        });

        // Act
        const size = messageSize(command);

        // Assert
        expect(size).toBe(16);
    });
});
