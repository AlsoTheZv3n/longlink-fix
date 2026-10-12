import { Text } from './Text';
import { Stack } from '@astryxdesign/core/Stack';
import { FileRequestContext } from './FileViewer';
import { useContext, useEffect, useState } from 'react';
import { Thumbnail } from '@astryxdesign/core/Thumbnail';

type ImageProps = {
    /** Hides the image without unmounting it. */
    hidden?: boolean;
    /** Scoped Solution image path, or an image data/blob URL. */
    src: string;
    /** Accessible description of the photo. */
    alt: string;
};

/** Displays a full-width, landscape photo through the isolated runtime's image capability. */
export function Image(props: ImageProps) {
    // Give each source its own loading state and object-URL lifecycle.
    return <ImageContent key={props.src} {...props} />;
}

/** Owns one scoped image request and releases its blob URL when unmounted. */
function ImageContent({ src, alt, hidden }: ImageProps) {
    const request = useContext(FileRequestContext)?.preview;
    const inline = src.startsWith('data:image/') || src.startsWith('blob:');

    // Inline images are immediately ready; scoped images wait for their host response.
    const [preview, setPreview] = useState<
        { status: 'loading' } | { status: 'error' } | { status: 'ready'; url: string }
    >(inline ? { status: 'ready', url: src } : { status: 'loading' });

    // Fetch Solution photos through the host instead of bypassing the sandbox's network policy.
    useEffect(() => {
        if (inline) return;

        let active = true;
        let objectUrl: string | undefined;

        // Validate the media type before creating a browser image resource.
        async function load() {
            try {
                const photo = await request?.(src);

                if (!active) return;

                // Reject non-image responses without exposing their contents in the View.
                if (!(photo instanceof Blob) || !photo.type.startsWith('image/')) {
                    setPreview({ status: 'error' });

                    return;
                }

                objectUrl = URL.createObjectURL(photo);
                setPreview({ status: 'ready', url: objectUrl });
            } catch {
                if (active) setPreview({ status: 'error' });
            }
        }

        void load();

        // Ignore late responses and release only URLs owned by this mounted image.
        return () => {
            active = false;

            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [inline, request, src]);

    // Reserve the same landscape frame for loading, errors, and the displayed photo.
    return (
        <Stack
            className={hidden ? 'hidden!' : 'aspect-video w-full overflow-hidden bg-muted'}
            align="center"
            justify="center"
        >
            {preview.status === 'error' ? (
                <Text type="supporting">Photo unavailable</Text>
            ) : (
                <Thumbnail
                    src={preview.status === 'ready' ? preview.url : undefined}
                    alt={alt}
                    isLoading={preview.status === 'loading'}
                    className="w-full! [&>div]:aspect-video! [&>div]:rounded-none!"
                />
            )}
        </Stack>
    );
}
