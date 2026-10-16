// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../render';
import { Showcase } from '@/components/Showcase';

it('keeps the public product preview independent of an authenticated account', () => {
    // Act
    const output = renderStatic(<Showcase />);

    // Assert
    expect(output.querySelector('img')).not.toBeNull();
    expect(output.querySelector('iframe')).toBeNull();
    expect(output.querySelector('form[action="/api/v1/auth/password/login"]')).toBeNull();
});
