import type { ReactNode } from 'react';
import { Link } from '@astryxdesign/core/Link';
import { Wordmark } from '@/components/Wordmark';
import { Stack } from '@astryxdesign/core/Stack';
import { Button } from '@astryxdesign/core/Button';
import { TopNav } from '@astryxdesign/core/TopNav';

/** Renders public navigation at the page's content width. */
export function Navbar({ maxWidth = 1000, navigation }: { maxWidth?: number; navigation?: ReactNode }) {
    return (
        <Stack as="header" className="border-b border-border bg-body" paddingInline={6}>
            <Stack className="mx-auto" maxWidth={maxWidth} width="100%">
                <TopNav
                    className="py-3"
                    heading={
                        <Link href="/" label="LongLink home" color="inherit">
                            <Wordmark size="heading" />
                        </Link>
                    }
                    label="Main navigation"
                    endContent={
                        <Stack direction="horizontal" gap={6} vAlign="center">
                            <Link href="/blog/" color="secondary" isStandalone weight="medium">
                                Blog
                            </Link>
                            <Link className="sm:hidden" href="/docs/" color="secondary" isStandalone weight="medium">
                                Docs
                            </Link>
                            <Stack className="hidden sm:flex" direction="horizontal" gap={4} vAlign="center">
                                {/* Use cases are a work in progress; keep hidden until ready.
                                    <Link href="/use-cases/" color="secondary" isStandalone weight="medium">
                                        Use cases
                                    </Link>
                                    */}
                                <Link href="/docs/" color="secondary" isStandalone weight="medium">
                                    Documentation
                                </Link>
                                <Link href="/pricing/" color="secondary" isStandalone weight="medium">
                                    Pricing
                                </Link>
                                <Link
                                    as="a"
                                    color="secondary"
                                    href="https://github.com/xLongLink/longlink"
                                    isExternalLink
                                    isStandalone
                                    weight="medium"
                                >
                                    GitHub
                                </Link>
                            </Stack>
                            <Button href="/login/" label="Sign In" size="sm" variant="primary" />
                        </Stack>
                    }
                />
                {navigation}
            </Stack>
        </Stack>
    );
}
