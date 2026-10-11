import type { Spacing } from './types';
import type { ReactNode } from 'react';
import { Stack } from '@astryxdesign/core/Stack';
import { DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Dialog as AstryxDialog } from '@astryxdesign/core/Dialog';

/** Displays an accessible modal with an explicit purpose and controlled visibility. */
export function Dialog(props: {
    /** Hides the modal without unmounting its fields or changing the caller's open state. */
    hidden?: boolean;
    children?: ReactNode;
    'aria-label': string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    purpose?: 'form' | 'info' | 'required';
    /** Preferred dialog width, clamped to the viewport, matching Platform dialogs. */
    width?: number | string;
    /** Frame height, limited by the viewport. Short content is vertically centered while longer content scrolls. */
    height?: number | string;
    /** Maximum dialog height within the View viewport. */
    maxHeight?: number | string;
    /** Content inset using the shared spacing scale. */
    padding?: Spacing;
    /** Maximum width of the centered content column. */
    contentWidth?: number | string;
}) {
    // Keep modal content inside a scroll region bounded by the View's viewport.
    return (
        <AstryxDialog
            aria-label={props['aria-label']}
            hidden={props.hidden}
            className={props.hidden ? 'hidden!' : undefined}
            isOpen={props.isOpen && !props.hidden}
            onOpenChange={props.onOpenChange}
            purpose={props.purpose ?? 'info'}
            width={props.width ?? 960}
            maxHeight={props.maxHeight ?? 'calc(100dvh - var(--spacing-10) * 4)'}
            padding={0}
        >
            <Stack gap={0} height={props.height ?? 'min(560px, calc(100dvh - var(--spacing-10) * 4))'}>
                <Layout
                    height="fill"
                    padding={0}
                    header={<DialogHeader title={props['aria-label']} onOpenChange={props.onOpenChange} />}
                >
                    <LayoutContent padding={props.padding ?? 4}>
                        {/* Grow beyond the scrollport rather than clipping tall, centered forms. */}
                        <Stack
                            gap={0}
                            minHeight="100%"
                            justify="center"
                            width="100%"
                            maxWidth={props.contentWidth}
                            className="mx-auto"
                        >
                            {props.children}
                        </Stack>
                    </LayoutContent>
                </Layout>
            </Stack>
        </AstryxDialog>
    );
}
