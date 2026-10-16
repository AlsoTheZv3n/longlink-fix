// @vitest-environment happy-dom
import { act } from 'react';
import { it, expect } from 'vitest';
import { withMounted } from '../../render';
import { TextInput } from '@/components/ui/TextInput';
import { Form, FormRequestContext } from '@/components/ui/Form';

it('submits named field values through the scoped capability', async () => {
    // Arrange
    const submissions: [string, [string, string | Blob][]][] = [];

    // Act
    await withMounted(
        <FormRequestContext
            value={async (path, options) => {
                submissions.push([path, options.form]);

                return null;
            }}
        >
            <Form action="/api/orders">
                <TextInput label="Name" name="name" defaultValue="Acme" />
            </Form>
        </FormRequestContext>,
        async (output) => {
            await act(async () => {
                output.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            });

            // Assert
            expect(submissions).toEqual([['/api/orders', [['name', 'Acme']]]]);
        }
    );
});
