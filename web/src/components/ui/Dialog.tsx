import type { Spacing } from './types';
import type { ReactNode } from 'react';
import { DialogClose } from './DialogClose';
import { Stack } from '@astryxdesign/core/Stack';
import { DialogHeader } from '@astryxdesign/core/Dialog';
import { Dialog as AstryxDialog } from '@astryxdesign/core/Dialog';

/** Displays an accessible modal that closes with Escape or its close button, not backdrop clicks. */
export function Dialog(props: {
    children?: ReactNode;
    /** Shows a dialog header when a title is provided. */
    title?: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    /** Spacing between the title and content; defaults to 3. */
    gap?: Spacing;
}) {
    // Share the Platform frame while letting content own its layout and scrolling.
    return (
        <AstryxDialog
            isOpen={props.isOpen}
            onOpenChange={props.onOpenChange}
            purpose="form"
            width={960}
            maxHeight="calc(100dvh - var(--spacing-10) * 4)"
            padding={0}
        >
            <DialogClose onClose={() => props.onOpenChange(false)} />
            <Stack gap={props.gap ?? 3} minHeight={0}>
                {props.title && <DialogHeader title={props.title} className="p-8 pe-16" />}
                {props.children}
            </Stack>
        </AstryxDialog>
    );
}
