import type { ReactNode } from 'react';
import { Links, Meta, Scripts, ScrollRestoration } from 'react-router';

export { Root as default, HydrateFallback } from '@/components/Root';

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
