// @vitest-environment happy-dom
import { act } from 'react';
import { it, expect } from 'vitest';
import { withMounted } from '../render';
import { Form } from '@/components/Form';
import { TextInput } from '@/components/ui/TextInput';

it('prevents submission when the caller disables the final mutation', async () => {
    // Arrange
    const submissions: FormData[] = [];

    // Act
    await withMounted(
        <Form
            action={(data) => {
                submissions.push(data);
            }}
            submitDisabled
        >
            <TextInput label="Name" name="name" defaultValue="Acme" />
        </Form>,
        async (output) => {
            await act(async () => {
                output.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            });

            // Assert
            expect(submissions).toEqual([]);
        }
    );
});
