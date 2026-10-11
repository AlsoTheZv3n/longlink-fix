import type { ReactNode } from 'react';
import { Root } from '@/components/Root';
import { Document } from '@/components/layouts/Document';
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
        <Document
            head={
                import.meta.env.PROD && (
                    <script
                        defer
                        src="https://cloud.umami.is/script.js"
                        data-website-id="eff115b8-10d7-4507-abf5-6b3de55eab3f"
                    />
                )
            }
        >
            {children}
        </Document>
    );
}
