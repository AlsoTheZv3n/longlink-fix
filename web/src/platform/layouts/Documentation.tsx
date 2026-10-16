import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Stack } from '@astryxdesign/core/Stack';
import { Outlet, useLocation } from 'react-router';
import { AppShell } from '@astryxdesign/core/AppShell';
import { documentationSections } from '@/platform/docs';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';

/** Renders documentation with section navigation, article, and outline columns. */
export default function Documentation() {
    const { pathname } = useLocation();
    const pagePath = pathname.replace(/\/+$/, '') || '/';

    const activeSection =
        pagePath === '/docs/alternatives' || pagePath.startsWith('/docs/alternatives/')
            ? 'Alternatives'
            : pagePath === '/docs/api' || pagePath.startsWith('/docs/api/')
              ? 'Platform'
              : 'Solutions';

    const sections = documentationSections.filter(
        (section) => section.title === 'Introduction' || section.title === activeSection
    );

    return (
        <Stack minHeight="100dvh">
            <Navbar
                maxWidth={1272}
                navigation={
                    <TabList aria-label="Documentation sections" value={activeSection} onChange={() => undefined}>
                        <Tab href="/docs/sdk/" label="Solutions" value="Solutions" />
                        <Tab href="/docs/api/" label="Platform" value="Platform" />
                        <Tab href="/docs/alternatives/" label="Alternatives" value="Alternatives" />
                    </TabList>
                }
            />
            <Stack className="mx-auto flex-1" maxWidth={1320} width="100%">
                <AppShell
                    className="min-h-0! [&_:has(>.astryx-app-shell-sidenav)]:h-fit! [&_:has(>.astryx-app-shell-sidenav)]:max-h-dvh"
                    height="auto"
                    mobileNav={{ breakpoint: 'lg' }}
                    variant="wash"
                    sideNav={
                        <SideNav aria-label="Documentation navigation">
                            <Stack paddingInline={4} paddingBlock={6}>
                                {sections.map((section) => (
                                    <SideNavSection key={section.title} title={section.title}>
                                        {section.pages.map((page) => (
                                            <SideNavItem
                                                key={page.path}
                                                href={`${page.path}/`}
                                                icon={<page.icon aria-hidden size={16} />}
                                                isSelected={pagePath === page.path}
                                                label={page.label}
                                            />
                                        ))}
                                    </SideNavSection>
                                ))}
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
