import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { legalPages } from '@/platform/legal';
import { Stack } from '@astryxdesign/core/Stack';
import { Outlet, useLocation } from 'react-router';
import { brandingPages } from '@/platform/branding';
import { AppShell } from '@astryxdesign/core/AppShell';
import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';

/** Renders legal and branding pages with the public article layout. */
export default function Legal() {
    const { pathname } = useLocation();
    const pagePath = pathname.replace(/\/+$/, '') || '/';

    return (
        <Stack minHeight="100dvh">
            <Navbar maxWidth={1272} />
            <Stack className="mx-auto flex-1" maxWidth={1320} width="100%">
                <AppShell
                    className="min-h-0! [&_:has(>.astryx-app-shell-sidenav)]:h-fit! [&_:has(>.astryx-app-shell-sidenav)]:max-h-dvh"
                    height="auto"
                    mobileNav={{ breakpoint: 'lg' }}
                    variant="wash"
                    sideNav={
                        <SideNav aria-label="Legal and branding navigation">
                            <Stack paddingInline={4} paddingBlock={6}>
                                <SideNavSection title="Legal">
                                    {legalPages.map((page) => (
                                        <SideNavItem
                                            key={page.path}
                                            href={`${page.path}/`}
                                            icon={<page.icon aria-hidden size={16} />}
                                            isSelected={pagePath === page.path}
                                            label={page.label}
                                        />
                                    ))}
                                </SideNavSection>
                                <SideNavSection title="Branding">
                                    {brandingPages.map((page) => (
                                        <SideNavItem
                                            key={page.path}
                                            href={page.path}
                                            icon={<page.icon aria-hidden size={16} />}
                                            isSelected={pagePath === page.path}
                                            label={page.label}
                                        />
                                    ))}
                                </SideNavSection>
                            </Stack>
                        </SideNav>
                    }
                >
                    <Outlet />
                </AppShell>
            </Stack>
            <Footer maxWidth={1272} />
        </Stack>
    );
}
