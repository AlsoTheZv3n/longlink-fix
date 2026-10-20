import { useApi } from '@/lib/hooks/use-api';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import { ApiBoundary } from '@/components/ApiBoundary';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import * as schemas from '@/lib/generated/platform-api-v1/zod.gen';

/** Shows the Organization's month-end usage and included allowances. */
export default function Usage({ base }: { base: string }) {
    // Share authoritative membership counts and rates without loading payment resources.
    const [usage] = useApi(`${base}/usage`, schemas.zOrganizationUsage);

    // Retain the existing settings shell and its spacing.
    return (
        <Stack gap={4}>
            <Stack justify="end" minHeight="var(--size-element-md)">
                <Heading level={2} hasCapsize>
                    Usage
                </Heading>
            </Stack>
            <Divider />
            <Card padding={0} className="overflow-hidden">
                <Stack gap={0}>
                    <Stack gap={1} paddingInline={4} paddingBlock={2} className="bg-muted">
                        <Heading level={3}>Monthly usage</Heading>
                    </Stack>
                    <Divider />
                    <Stack gap={4} padding={4}>
                        <ProgressBar
                            label="Users"
                            value={usage.users}
                            max={usage.free_users}
                            hasValueLabel
                            formatValueLabel={() => `${usage.users} / ${usage.free_users}`}
                        />
                        {(['storage', 'database'] as const).map((resource) => (
                            <ApiBoundary
                                key={resource}
                                fallback={<Text color="secondary">Loading {resource} usage…</Text>}
                                fallbackRender={({ resetErrorBoundary }) => (
                                    <Stack direction="horizontal" align="center" justify="between" gap={4}>
                                        <Text color="secondary">
                                            {resource === 'storage' ? 'File storage' : 'Database storage'} usage
                                            unavailable.
                                        </Text>
                                        <Button label="Retry" onClick={resetErrorBoundary} />
                                    </Stack>
                                )}
                            >
                                <UsageMeter
                                    base={base}
                                    resource={resource}
                                    included={
                                        resource === 'storage' ? usage.free_storage_bytes : usage.free_database_bytes
                                    }
                                />
                            </ApiBoundary>
                        ))}
                    </Stack>
                </Stack>
            </Card>
        </Stack>
    );
}

/** Shows measured storage against the included allowance independently of the other usage reads. */
function UsageMeter({
    base,
    resource,
    included,
}: {
    base: string;
    resource: 'storage' | 'database';
    included: number;
}) {
    const [usage] = useApi(
        `${base}/${resource}`,
        resource === 'storage' ? schemas.zOrganizationStorageUsageResponse : schemas.zOrganizationDatabaseUsageResponse
    );

    return (
        <ProgressBar
            label={resource === 'storage' ? 'File storage' : 'Database storage'}
            value={usage.space_used}
            max={included}
            hasValueLabel
            formatValueLabel={() => `${formatStorage(usage.space_used)} / ${formatStorage(included)}`}
        />
    );
}

/** Formats included and measured usage using the same binary units. */
function formatStorage(bytes: number) {
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
    const unit = bytes === 0 ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);

    return `${(bytes / 1024 ** unit).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${units[unit]}`;
}
