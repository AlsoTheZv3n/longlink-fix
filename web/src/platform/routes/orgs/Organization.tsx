import type { z } from 'zod';
import { NoIndex } from '@/components/NoIndex';
import { useOutletContext } from 'react-router';
import SolutionManagement from './SolutionManagement';
import * as schemas from '@/lib/generated/platform-api-v1/zod.gen';

/** Lists an organization's Solutions; the layout owns organization-scoped state resets. */
export default function Organization() {
    const membership = useOutletContext<z.output<typeof schemas.zUserOrganizationMembership>>();

    return (
        <>
            <NoIndex title="Organization Solutions | LongLink" />
            <SolutionManagement
                organization={membership.organization}
                canMaintain={['maintain', 'admin', 'owner'].includes(membership.role)}
                presentation="overview"
            />
        </>
    );
}
