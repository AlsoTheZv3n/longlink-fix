import type { Spacing } from './types';
import type { ReactNode } from 'react';
import {
    Layout as AstryxLayout,
    LayoutContent as AstryxLayoutContent,
    LayoutHeader as AstryxLayoutHeader,
    LayoutFooter as AstryxLayoutFooter,
    LayoutPanel as AstryxLayoutPanel,
} from '@astryxdesign/core/Layout';

/** Arranges header, footer, side panels, and main content within a View or bounded container. */
export function Layout(props: {
    /** Hides the layout without unmounting its content. */
    hidden?: boolean;
    /** Main content; shorthand for the content slot. */
    children?: ReactNode;
    content?: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    start?: ReactNode;
    end?: ReactNode;
    /** Fill a bounded container or grow with content. */
    height?: 'fill' | 'auto';
    /** Maximum aligned content width; numbers are pixels and strings are CSS sizes. */
    contentWidth?: number | string;
    /** Insets this layout's regions using the spacing scale. Omit to retain Astryx's contextual padding. */
    padding?: Spacing;
    /** Default for header and footer dividers; omitted values inherit the surrounding layout. */
    defaultHasDividers?: boolean;
}) {
    // Preserve Astryx's slot layout and contextual spacing without introducing custom sizing behavior.
    return <AstryxLayout {...props} className={props.hidden ? 'hidden!' : undefined} height={props.height ?? 'fill'} />;
}

/** Provides the main content region, with optional independently scrollable overflow. */
export function LayoutContent(props: {
    /** Hides the region without unmounting its content. */
    hidden?: boolean;
    children?: ReactNode;
    padding?: Spacing;
    isScrollable?: boolean;
    /** Accessible name for the region; distinguish repeated landmarks with labels. */
    label?: string;
    role?: 'main' | 'region';
}) {
    // Let Astryx align the content and inherit padding from its containing layout.
    return (
        <AstryxLayoutContent
            {...props}
            className={props.hidden ? 'hidden!' : undefined}
            isScrollable={props.isScrollable ?? true}
        />
    );
}

/** Keeps titles and toolbars above the main content region. */
export function LayoutHeader(props: {
    /** Hides the header without unmounting its content. */
    hidden?: boolean;
    children?: ReactNode;
    /** Overrides the surrounding layout's divider default when provided. */
    hasDivider?: boolean;
    /** Header height; numbers are pixels and strings are CSS sizes. */
    height?: number | string;
    padding?: Spacing;
    paddingBlockEnd?: Spacing;
    label?: string;
    /** Use banner only for a site-wide header, not a nested View section. */
    role?: 'banner' | 'region';
}) {
    // Keep inherited divider behavior and Astryx's header padding collapse intact.
    return <AstryxLayoutHeader {...props} className={props.hidden ? 'hidden!' : undefined} />;
}

/** Keeps actions, pagination, or status below the main content region. */
export function LayoutFooter(props: {
    /** Hides the footer without unmounting its content. */
    hidden?: boolean;
    children?: ReactNode;
    /** Overrides the surrounding layout's divider default when provided. */
    hasDivider?: boolean;
    /** Footer height; numbers are pixels and strings are CSS sizes. */
    height?: number | string;
    padding?: Spacing;
    label?: string;
    /** Use contentinfo only for a site-wide footer, not a nested View section. */
    role?: 'contentinfo' | 'region';
}) {
    // Retain the shared footer's divider inheritance and contextual spacing.
    return <AstryxLayoutFooter {...props} className={props.hidden ? 'hidden!' : undefined} />;
}

/** Provides a side region in a Layout's start or end slot without automatic narrow-screen reflow. */
export function LayoutPanel(props: {
    /** Hides the panel without unmounting its content. */
    hidden?: boolean;
    children?: ReactNode;
    hasDivider?: boolean;
    padding?: Spacing;
    isScrollable?: boolean;
    label?: string;
    role?: 'complementary' | 'navigation' | 'region';
    /** Panel width; numbers are pixels and strings are CSS sizes. */
    width?: number | string;
}) {
    // Keep panel sizing, divider placement, and scrolling owned by Astryx.
    return (
        <AstryxLayoutPanel
            {...props}
            className={props.hidden ? 'hidden!' : undefined}
            isScrollable={props.isScrollable ?? true}
        />
    );
}
