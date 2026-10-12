import { createContext, useContext, useEffect, useState } from 'react';

// Only the isolated runtime supplies scoped preview and download capabilities.
export const FileRequestContext = createContext<{
    preview: (path: string) => Promise<Blob>;
    download: (path: string, filename: string) => Promise<void>;
} | null>(null);

type PreviewState =
    | { status: 'loading' }
    | { status: 'unsupported' }
    | { status: 'error'; cause: unknown }
    | { status: 'ready'; url: string };

/** Owns a mounted image preview; inline sources remain caller-owned and never acquire a request. */
export function usePreview(src: string, inline = false): PreviewState {
    const request = useContext(FileRequestContext)?.preview;

    // Inline images are immediately ready; scoped images wait for their host response.
    const [preview, setPreview] = useState<PreviewState>(
        inline ? { status: 'ready', url: src } : { status: 'loading' }
    );

    // Keep each scoped request and its object URL within this mounted preview's lifetime.
    useEffect(() => {
        if (inline) return;

        let active = true;
        let objectUrl: string | undefined;

        /** Accepts only image bytes and ignores responses after this attempt has closed. */
        async function load() {
            try {
                const value = await request?.(src);

                if (!active) return;

                // Reject non-image responses without exposing their contents in the View.
                if (!(value instanceof Blob) || !value.type.startsWith('image/')) {
                    setPreview({ status: 'unsupported' });

                    return;
                }

                objectUrl = URL.createObjectURL(value);
                setPreview({ status: 'ready', url: objectUrl });
            } catch (cause) {
                if (active) setPreview({ status: 'error', cause });
            }
        }

        void load();

        // Ignore late responses and release only URLs owned by this mounted preview.
        return () => {
            active = false;

            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [inline, request, src]);

    return preview;
}
