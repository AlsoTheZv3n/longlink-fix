import { useCallback } from 'react';
import { Link, type LinkProps } from 'react-router';
import { SideNavItem as AstryxSideNavItem, type SideNavItemProps } from '@astryxdesign/core/SideNav';

/** Applies LongLink's router navigation policy to themed navigation items. */
export function SideNavItem(props: Omit<SideNavItemProps, 'as'>) {
    // Keep the inline link stable across renders while pushing repeated selections into history.
    return (
        <AstryxSideNavItem
            {...props}
            as={useCallback(
                (linkProps: LinkProps) => (
                    <Link {...linkProps} replace={false} />
                ),
                []
            )}
        />
    );
}
