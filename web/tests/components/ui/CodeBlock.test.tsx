// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { CodeBlock } from '@/components/ui/CodeBlock';

it('renders code as text rather than executable markup', () => {
    // Act
    const output = renderStatic(<CodeBlock code={'<script>alert(1)</script>'} language="html" />);

    // Assert
    expect(output.textContent).toContain('<script>alert(1)</script>');
    expect(output.querySelector('script')).toBeNull();
});
