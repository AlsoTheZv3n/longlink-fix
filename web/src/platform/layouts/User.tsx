import { Outlet } from 'react-router';
import { ProfileMenu } from '@/components/Profile';
import { userNavigation } from '@/platform/routes';
import Platform from '@/components/layouts/Platform';
import { useAuthenticatedUser } from '@/lib/hooks/use-user';

/** Renders the fixed account navigation around user pages. */
export default function UserLayout() {
    const user = useAuthenticatedUser();

    return (
        <Platform action={<ProfileMenu user={user} />} tabs={userNavigation}>
            <Outlet />
        </Platform>
    );
}
