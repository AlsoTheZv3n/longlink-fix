import { it, expect } from 'vitest';
// @vitest-environment happy-dom
import { useForm } from 'react-hook-form';
import { renderStatic } from '../../../render';
import { TextField } from '@/platform/routes/auth/Field';

it('retains form-owned values and submission names', () => {
    // Arrange
    function Probe() {
        const form = useForm({ defaultValues: { email: 'owner@example.com' } });

        return <TextField control={form.control} name="email" label="Email" />;
    }

    // Act
    const output = renderStatic(<Probe />);

    // Assert
    expect(output.querySelector('input[name="email"]')?.getAttribute('value')).toBe('owner@example.com');
});
