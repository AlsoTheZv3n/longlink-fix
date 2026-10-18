import * as icons from '@/lib/icons';
import { ApiErrorContext } from '@/lib/errors';
import { PageLoading } from '@/components/Utils';
import { Theme } from '@astryxdesign/core/theme';
import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import { useToast } from '@astryxdesign/core/Toast';
import { stoneTheme } from '@/lib/generated/stone.js';
import { ApiBoundary } from '@/components/ApiBoundary';
import { createQueryRuntime } from '@/lib/react-query';
import { LinkProvider } from '@astryxdesign/core/Link';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { IconRequestContext } from '@/components/ui/Icon';
import { QueryClientProvider } from '@tanstack/react-query';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import '@/index.css';

/** Shows the themed loading state while the initial route modules load. */
export function HydrateFallback() {
    // The route provider has not mounted yet, so the fallback owns only its theme.
    return (
        <Theme theme={stoneTheme} mode="dark">
            <PageLoading label="Loading" />
        </Theme>
    );
}

/** Provides isolated runtime state around the active Solution route. */
export default function SolutionRoot() {
    // Keep theme, link, layer, and API ownership around the active route.
    return (
        <Theme theme={stoneTheme} mode="dark">
            <LinkProvider component={RouterLink}>
                <LayerProvider toast={{ position: 'bottomEnd' }}>
                    <IconRequestContext value={icons.load}>
                        <ApiProvider>
                            <ApiBoundary>
                                <Outlet />
                            </ApiBoundary>
                        </ApiProvider>
                    </IconRequestContext>
                </LayerProvider>
            </LinkProvider>
        </Theme>
    );
}

/** Connects cache and direct-request failures to the notification layer. */
function ApiProvider({ children }: { children: ReactNode }) {
    const toast = useToast();

    const [runtime] = useState(() =>
        createQueryRuntime(
            (body) => {
                toast({ body, type: 'error', isAutoHide: true });
            },
            import.meta.env.MODE !== 'sdk'
        )
    );

    return (
        <ApiErrorContext value={runtime.reportError}>
            <QueryClientProvider client={runtime.client}>{children}</QueryClientProvider>
        </ApiErrorContext>
    );
}

/** Renders the Solution HTML document shell. */
export function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="robots" content="noindex, nofollow" />
                <Meta />
                <Links />
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" sizes="any" />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

/** Declares metadata for the SDK's static SPA fallback document. */
export const meta = () => [{ title: 'LongLink' }];
