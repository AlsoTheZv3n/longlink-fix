import type { z } from 'zod';
import { ProfileMenu } from '@/components/Profile';
import { AppWindow, Settings2 } from 'lucide-react';
import Platform from '@/components/layouts/Platform';
import { ApiBoundary } from '@/components/ApiBoundary';
import { PageContainer } from '@/components/PageContainer';
import { useAuthenticatedUser } from '@/lib/hooks/use-user';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';
import { Outlet, useParams, useOutletContext } from 'react-router';
import { zUserOrganizationMembership } from '@/lib/generated/platform-api-v1/zod.gen';

/** Renders the fixed navigation around organization pages. */
export default function OrganizationLayout() {
    const { organization = '' } = useParams();
    const user = useAuthenticatedUser();
    const membership = useOutletContext<z.output<typeof zUserOrganizationMembership>>();

    return (
        <Platform
            action={<ProfileMenu user={user} />}
            breadcrumb={<PageBreadcrumb />}
            tabs={[
                { href: `/orgs/${organization}`, icon: AppWindow, label: 'Solutions' },
                { href: `/orgs/${organization}/settings`, icon: Settings2, label: 'Settings' },
            ]}
        >
            <PageContainer gap={8} padding={2}>
                <ApiBoundary>
                    <Outlet context={membership} />
                </ApiBoundary>
            </PageContainer>
        </Platform>
    );
}
