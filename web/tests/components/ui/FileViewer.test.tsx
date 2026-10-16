// @vitest-environment happy-dom
import { act } from 'react';
import { it, expect } from 'vitest';
import { withMounted } from '../../render';
import { FileViewer } from '@/components/ui/FileViewer';
import { FileRequestContext } from '@/components/ui/preview';

it('sanitizes display names before requesting a scoped download', async () => {
    // Arrange
    const downloads: [string, string][] = [];

    const files = {
        preview: async () => new Blob(),
        download: async (path: string, name: string) => {
            downloads.push([path, name]);
        },
    };

    // Act
    await withMounted(
        <FileRequestContext value={files}>
            <FileViewer src="/api/invoice" title="reports/invoice.pdf" />
        </FileRequestContext>,
        async (output) => {
            const download = [...output.querySelectorAll('button')].find((button) =>
                button.textContent?.includes('Download')
            );

            await act(async () => download?.click());

            // Assert
            expect(downloads).toEqual([['/api/invoice', 'reports_invoice.pdf']]);
        }
    );
});
