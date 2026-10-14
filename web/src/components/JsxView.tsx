import { ApiError } from '@/lib/api';
import * as icons from '@/lib/icons';
import * as host from '@/views/host';
import { useNavigate } from 'react-router';
import { resolveNavigationUrl } from '@/lib/url';
import { useQuery } from '@tanstack/react-query';
import type { ViewRuntime } from '@/views/manifest';
import { useEffect, useRef, useState } from 'react';
import { PageError, PageLoading } from '@/components/Utils';
import {
    commandSchema,
    parametersSchema,
    MAX_PENDING_REQUESTS,
    MAX_PENDING_ICONS,
    MAX_MESSAGE_SIZE,
    MAX_RUNTIME_SIZE,
    messageSize,
    iconDataSchema,
    type ViewData,
} from '@/views/protocol';

const BOOTSTRAP_TIMEOUT_MS = 10_000;

const STARTUP_FAILURES = {
    assets: 'The View runtime assets could not be loaded or did not match the manifest.',
    preparation: 'The isolated View document could not be prepared.',
    transfer: 'The isolated View could not receive its startup capabilities.',
    readiness: 'The isolated View did not become ready within 10 seconds.',
} as const;

/** Renders Solution code only in a credential-free, opaque-origin sandbox. */
export function JsxView({
    source,
    params,
    requestBaseUrl,
    navigationBaseUrl,
    runtime,
}: {
    source: string;
    params: Record<string, string>;
    requestBaseUrl: string;
    navigationBaseUrl: string;
    runtime: ViewRuntime;
}) {
    const frame = useRef<HTMLIFrameElement>(null);
    const navigate = useNavigate();
    const [height, setHeight] = useState(1);

    const [bootstrapState, setBootstrapState] = useState<
        | { status: 'preparing' }
        | { status: 'prepared'; document: string }
        | { status: 'failed'; stage: keyof typeof STARTUP_FAILURES }
    >({ status: 'preparing' });

    const parameters = JSON.stringify(params);

    const { data: kernel, error: runtimeError } = useQuery({
        queryKey: ['view-runtime', requestBaseUrl, runtime],
        staleTime: Infinity,
        retry: false,
        queryFn: async ({ signal }) => {
            // Load the declared runtime only within its Solution proxy.
            const urls = ['views/runtime.js', 'views/runtime.css'].map((path) => {
                const url = new URL(host.requestUrl(requestBaseUrl, path), window.location.origin);
                url.searchParams.set('v', runtime.version);

                return url.href;
            });

            const assets = await Promise.all(
                urls.map(async (url) => {
                    const body = await host.load(url, { signal }, MAX_RUNTIME_SIZE);

                    return body.text();
                })
            );

            // Reject stale or mixed runtime assets instead of silently rendering with the wrong components.
            const digest = await crypto.subtle.digest(
                'SHA-256',
                new TextEncoder().encode(`${assets[0]}\n${assets[1]}`)
            );

            const version = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');

            if (version !== runtime.version) throw new Error('The Solution View runtime does not match its manifest');

            return assets;
        },
    });

    useEffect(() => {
        // Report only the failure stage and error type, never source or response data.
        if (import.meta.env.DEV && runtimeError) console.error('View startup failed: assets', runtimeError.name);
    }, [runtimeError]);

    useEffect(() => {
        if (!kernel) return;
        const [script, styles] = kernel;
        const controller = new AbortController();
        const channel = new MessageChannel();
        const session = crypto.randomUUID();
        const pending = new Map<number, 'icon' | 'operation'>();
        let handshakeTimer: ReturnType<typeof setTimeout> | undefined;

        /** Revokes the attempt's capabilities and startup deadline on failure or unmount. */
        function dispose(): void {
            controller.abort();
            clearTimeout(handshakeTimer);
            window.removeEventListener('message', ready);
            channel.port1.close();
            channel.port2.close();
        }

        /** Reports startup failure only while this attempt still owns the mounted frame. */
        function fail(stage: keyof typeof STARTUP_FAILURES, errorType = 'Error'): void {
            if (controller.signal.aborted) return;
            dispose();

            // Keep technical diagnostics local to development without exposing exception messages or payloads.
            if (import.meta.env.DEV) console.error('View startup failed:', stage, errorType);
            setBootstrapState({ status: 'failed', stage });
        }

        /** Connects only this sandbox instance; subsequent window messages have no capabilities. */
        function ready(event: MessageEvent<unknown>): void {
            if (controller.signal.aborted) return;

            if (event.source !== frame.current?.contentWindow || event.origin !== 'null') return;

            if (event.data !== session) return;
            window.removeEventListener('message', ready);

            // A failed capability transfer is a startup failure, not a connected runtime.
            try {
                frame.current?.contentWindow?.postMessage(
                    { session, source, params: parametersSchema.parse(JSON.parse(parameters)) },
                    '*',
                    [channel.port2]
                );
                clearTimeout(handshakeTimer);
            } catch (error) {
                fail('transfer', error instanceof Error ? error.name : 'Error');
            }
        }

        // Authenticate the bootstrap by its WindowProxy and fresh session before transferring a private port.
        window.addEventListener('message', ready);
        channel.port1.onmessage = async (event: MessageEvent<unknown>) => {
            const parsed = commandSchema.safeParse(event.data);

            if (!parsed.success || controller.signal.aborted) return;
            const command = parsed.data;

            // Size the isolated document without creating a second page scrollport.
            if (command.type === 'resize') {
                setHeight(command.height);

                return;
            }

            if (command.type === 'navigate') {
                try {
                    // Open web destinations only during user activation, without exposing the host to the new page.
                    const path = command.path.trim();

                    if (URL.canParse(path) || path.startsWith('//')) {
                        const url = new URL(path, window.location.origin);

                        if (
                            (url.protocol === 'https:' || url.protocol === 'http:') &&
                            !url.username &&
                            !url.password &&
                            navigator.userActivation.isActive
                        ) {
                            window.open(url.href, '_blank', 'noopener,noreferrer');
                        }

                        return;
                    }

                    // Keep relative navigation scoped to the current Solution.
                    host.requestUrl(navigationBaseUrl, command.path);
                    const destination = resolveNavigationUrl(navigationBaseUrl, command.path);

                    if (destination) await navigate(destination);
                } catch {
                    // Invalid navigation does not acquire any host capability.
                }

                return;
            }

            if (pending.has(command.id)) return;

            // Bound icons independently so on-demand glyphs cannot starve Solution operations.
            const budget = command.type === 'icon' ? 'icon' : 'operation';
            const count = [...pending.values()].filter((entry) => entry === budget).length;

            if (count >= (budget === 'icon' ? MAX_PENDING_ICONS : MAX_PENDING_REQUESTS)) {
                channel.port1.postMessage({
                    id: command.id,
                    ok: false,
                    error: 'Too many pending requests',
                    status: 429,
                });

                return;
            }

            pending.set(command.id, budget);

            // The frame chooses a catalog icon or Solution-relative operation, never URLs or fetch options.
            try {
                if (command.type === 'request' && messageSize(command) > MAX_MESSAGE_SIZE) {
                    throw new ApiError('Solution request is too large', 413);
                }

                let data: ViewData;

                if (command.type === 'icon') {
                    // Import only host-owned Lucide modules and transfer validated geometry, not code.
                    const icon = await icons.load(command.name);
                    data = iconDataSchema.parse(icon);
                } else if (command.type === 'download') {
                    data = await host.download(requestBaseUrl, command, controller.signal);
                } else {
                    data = await host.request(requestBaseUrl, command, controller.signal);
                }

                if (!controller.signal.aborted) channel.port1.postMessage({ id: command.id, ok: true, data });
            } catch (error) {
                if (!controller.signal.aborted)
                    channel.port1.postMessage({ id: command.id, ok: false, ...host.requestError(error) });
            } finally {
                pending.delete(command.id);
            }
        };

        /** Confines runtime assets to the sandbox; View source is transferred as data, never interpolated into HTML. */
        async function bootstrap(): Promise<void> {
            const code = `window.__VIEW_SESSION__=${JSON.stringify(session)};\n${script}`.replace(
                /<\/script/gi,
                '<\\/script'
            );

            const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
            const hash = btoa(String.fromCharCode(...new Uint8Array(digest)));
            const policy = `default-src 'none'; script-src 'sha256-${hash}' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`;

            if (!controller.signal.aborted) {
                // A blocked bootstrap script must surface an error instead of leaving a blank frame.
                handshakeTimer = setTimeout(() => fail('readiness'), BOOTSTRAP_TIMEOUT_MS);
                const document = `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer"><style>${styles.replace(/<\/style/gi, '<\\/style')}</style></head><body class="overflow-hidden bg-transparent text-primary"><main id="view"></main><script>${code}</script></body></html>`;

                // Keep startup failure latched until the route owner mounts a fresh View.
                setBootstrapState((current) =>
                    current.status === 'failed' ? current : { status: 'prepared', document }
                );
            }
        }

        void bootstrap().catch(() => fail('preparation'));

        // Replacing or unmounting a View revokes its channel and cancels every outstanding operation.
        return dispose;
    }, [source, parameters, requestBaseUrl, navigationBaseUrl, navigate, kernel]);

    if (runtimeError) return <PageError title="Unable to load this View" description={STARTUP_FAILURES.assets} />;

    if (bootstrapState.status === 'failed')
        return <PageError title="Unable to load this View" description={STARTUP_FAILURES[bootstrapState.stage]} />;

    // Keep runtime fetching and document preparation visible before mounting the sandbox.
    if (bootstrapState.status === 'preparing') return <PageLoading label="Preparing View" />;

    return (
        // Grow with the isolated content so the same page scrollport serves native pages and Views.
        <iframe
            ref={frame}
            title="Solution View"
            // Allow native validation and submit events; CSP form-action blocks direct form navigation.
            sandbox="allow-scripts allow-forms"
            referrerPolicy="no-referrer"
            srcDoc={bootstrapState.document}
            className="block w-full shrink-0 border-0 bg-transparent"
            style={{ height }}
        />
    );
}
