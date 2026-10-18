import { ApiBoundary } from '@/components/ApiBoundary';
import { PageContainer } from '@/components/PageContainer';
import OrganizationManagement from './OrganizationManagement';

/** Lists the current user's organizations and creates new organizations. */
export default function Organizations() {
    // Keep the page inside the existing Platform shell and request boundary.
    return (
        <PageContainer padding={2}>
            <title>Organizations | LongLink</title>
            <ApiBoundary>
                <OrganizationManagement presentation="overview" />
            </ApiBoundary>
        </PageContainer>
    );
}
