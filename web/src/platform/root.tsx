import type { ReactNode } from 'react';
import { Root } from '@/components/Root';
import { Links, Meta, Scripts, ScrollRestoration } from 'react-router';
// Handwritten fonts belong only to native Platform pages, not the embedded SDK application.
import '@fontsource/kalam';
import '@fontsource/kalam/700.css';

export { HydrateFallback } from '@/components/Root';

/** Provides the shared runtime and native Platform fonts. */
export default function PlatformRoot() {
    return <Root />;
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
