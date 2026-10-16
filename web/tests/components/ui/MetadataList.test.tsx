// @vitest-environment happy-dom
import { it, expect } from 'vitest';
import { renderStatic } from '../../render';
import { MetadataList, MetadataListItem } from '@/components/ui/MetadataList';

it('preserves authored metadata labels and values', () => {
    // Act
    const output = renderStatic(
        <MetadataList>
            <MetadataListItem label="Owner">Acme</MetadataListItem>
        </MetadataList>
    );

    // Assert
    expect(output.textContent).toContain('Owner');
    expect(output.textContent).toContain('Acme');
});
