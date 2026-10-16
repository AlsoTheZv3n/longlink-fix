import { Outlet } from 'react-router';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Stack, StackItem } from '@astryxdesign/core/Stack';

/** Renders public page chrome around page-specific content. */
export default function Page() {
    return (
        <Stack minHeight="100vh">
            <Navbar />
            <StackItem size="fill">
                <Outlet />
            </StackItem>
            <Footer />
        </Stack>
    );
}
