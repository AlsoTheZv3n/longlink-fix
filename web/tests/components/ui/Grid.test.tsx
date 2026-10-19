// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { Grid, GridSpan } from '@/components/ui/Grid';

it('renders grid item content', () => {
    // Act
    const output = renderStatic(
        <Grid columns={2}>
            <GridSpan>Retained draft</GridSpan>
        </Grid>
    );

    // Assert
    expect(output.textContent).toContain('Retained draft');
});
