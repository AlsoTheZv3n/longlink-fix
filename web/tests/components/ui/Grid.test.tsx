// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Grid, GridSpan } from '@/components/ui/Grid';

it('retains hidden grid items without removing their content', () => {
    // Act
    const output = renderStatic(
        <Grid columns={2}>
            <GridSpan hidden>Retained draft</GridSpan>
        </Grid>
    );

    // Assert
    expect(output.textContent).toContain('Retained draft');
    expect(output.querySelector('.hidden\\!')).not.toBeNull();
});
