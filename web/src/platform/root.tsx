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
// Handwritten fonts belong only to native Platform pages, not the embedded SDK application.
import '@fontsource/kalam';
import '@fontsource/kalam/700.css';

/** Shows the themed loading state while the initial route modules load. */
export function HydrateFallback() {
    // The route provider has not mounted yet, so the fallback owns only its theme.
    return (
        <Theme theme={stoneTheme} mode="dark">
            <PageLoading label="Loading" />
        </Theme>
    );
}

/** Provides the Platform runtime and native fonts. */
export default function PlatformRoot() {
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

/** Adds website analytics only to production Platform documents. */
export function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <Meta />
                <Links />
                <link rel="icon" href="/favicon.ico" />
                <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml" sizes="any" />
                {import.meta.env.PROD && (
                    <script
                        defer
                        src="https://cloud.umami.is/script.js"
                        data-website-id="eff115b8-10d7-4507-abf5-6b3de55eab3f"
                    />
                )}
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
