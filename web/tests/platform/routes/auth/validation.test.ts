import { it, expect } from 'vitest';
import { emailSchema, passwordSchema } from '@/platform/routes/auth/validation';

it('normalizes email without modifying opaque password content', () => {
    // Assert
    expect(emailSchema.parse(' owner@example.com ')).toBe('owner@example.com');
    expect(passwordSchema.parse(' password ')).toBe(' password ');
    expect(passwordSchema.safeParse('').success).toBe(false);
    expect(passwordSchema.safeParse('x'.repeat(1025)).success).toBe(false);
});
