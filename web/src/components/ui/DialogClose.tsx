import { X } from 'lucide-react';
import { IconButton } from '@astryxdesign/core/IconButton';

/** Keeps an accessible close control visible above a dialog's scrolling content. */
export function DialogClose({ onClose }: { onClose: () => void }) {
    // Anchor dismissal to the dialog surface without changing its content layout.
    return (
        <IconButton
            label="Close dialog"
            tooltip="Close"
            icon={<X className="size-5" aria-hidden="true" />}
            variant="ghost"
            className="absolute top-3 end-3 z-10"
            onClick={onClose}
        />
    );
}
