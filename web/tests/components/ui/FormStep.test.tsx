// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Form } from '@/components/ui/Form';
import { FormStep } from '@/components/ui/FormStep';
import { TextInput } from '@/components/ui/TextInput';

it('keeps inactive step fields mounted within the owning form', () => {
    // Act
    const output = renderStatic(
        <Form action="/api/orders">
            <FormStep label="Customer">
                <TextInput label="Customer" name="customer" />
            </FormStep>
            <FormStep label="Notes">
                <TextInput label="Notes" name="notes" />
            </FormStep>
        </Form>
    );

    // Assert
    const notes = output.querySelector('form [data-form-step="1"][hidden] input[name="notes"]');

    expect(notes).not.toBeNull();
    expect(notes?.matches(':disabled')).toBe(false);
    expect(output.querySelectorAll('[data-form-step]')).toHaveLength(2);
});
