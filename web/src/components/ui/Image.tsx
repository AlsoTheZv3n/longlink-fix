import { Text } from './Text';
import { usePreview } from './preview';
import { Stack } from '@astryxdesign/core/Stack';
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
    const inline = src.startsWith('data:image/') || src.startsWith('blob:');
    const preview = usePreview(src, inline);

    // Reserve the same landscape frame for loading, errors, and the displayed photo.
    return (
        <Stack
            className={hidden ? 'hidden!' : 'aspect-video w-full overflow-hidden bg-muted'}
            align="center"
            justify="center"
        >
            {preview.status === 'error' || preview.status === 'unsupported' ? (
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
