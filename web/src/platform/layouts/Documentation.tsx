import { Navbar } from '@/components/Navbar';
import { Stack } from '@astryxdesign/core/Stack';
import { Outlet, useLocation } from 'react-router';
import { AppShell } from '@astryxdesign/core/AppShell';
import { documentationSections } from '@/platform/docs';
import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';

/** Renders documentation with flat navigation, article, and outline columns. */
export default function Documentation() {
    const { pathname } = useLocation();
    const pagePath = pathname.replace(/\/+$/, '') || '/';

    return (
        <>
            <Navbar maxWidth={1272} />
            <Stack className="mx-auto" maxWidth={1320} width="100%">
                <AppShell
                    height="auto"
                    mobileNav={{ breakpoint: 'lg' }}
                    variant="wash"
                    sideNav={
                        <SideNav aria-label="Documentation navigation">
                            <Stack paddingInline={4} paddingBlock={6}>
                                {documentationSections.map((section) => (
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
        </>
    );
}
