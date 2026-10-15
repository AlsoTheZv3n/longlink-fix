import { resolveNavigationUrl } from '@/lib/url';
import { Link as AstryxLink } from '@astryxdesign/core/Link';
import { createContext, useContext, type ReactNode } from 'react';

// The sandbox supplies a host navigation capability; native previews use ordinary links.
export const LinkNavigationContext = createContext<{
    baseUrl: string;
    navigate: (path: string, newTab?: boolean) => void;
} | null>(null);

/** Navigates within the Solution or opens an external HTTP(S) URL in a new tab. */
export function Link({
    to,
    children,
    hidden,
}: {
    /** Hides the component without unmounting it. */
    hidden?: boolean;
    to: string;
    children?: ReactNode;
}) {
    const navigation = useContext(LinkNavigationContext);

    // Native browser actions use the same Solution destination as bridge navigation.
    const href = navigation ? resolveNavigationUrl(navigation.baseUrl, to) || to : to;

    // Delegate sandbox navigation to the bridge instead of loading a page in the frame.
    return (
        <AstryxLink
            hidden={hidden}
            className={hidden ? 'hidden!' : undefined}
            href={href}
            onClick={
                navigation
                    ? (event) => {
                          event.preventDefault();
                          navigation.navigate(to, event.ctrlKey || event.metaKey || event.shiftKey);
                      }
                    : undefined
            }
            onAuxClick={
                navigation
                    ? (event) => {
                          // Middle-click opens through the host without granting popup capabilities to the frame.
                          if (event.button !== 1) return;
                          event.preventDefault();
                          navigation.navigate(to, true);
                      }
                    : undefined
            }
        >
            {children}
        </AstryxLink>
    );
}
