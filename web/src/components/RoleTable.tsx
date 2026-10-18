import { Text } from '@astryxdesign/core/Text';
import type { LucideIcon } from 'lucide-react';
import { Stack } from '@astryxdesign/core/Stack';
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@astryxdesign/core/Table';

/** Renders the same permission table for organization and Solution roles. */
export function RoleTable({ roles }: { roles: ReadonlyArray<{ name: string; access: string; icon: LucideIcon }> }) {
    return (
        <Table density="compact">
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>Roles</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {roles.map(({ access, icon: RoleIcon, name }) => (
                    <TableRow key={name}>
                        <TableCell>
                            <Stack gap={0}>
                                <Stack direction="horizontal" gap={2} align="center">
                                    <RoleIcon aria-hidden="true" className="text-accent" size={16} />
                                    <Text className="capitalize" weight="semibold">
                                        {name}
                                    </Text>
                                </Stack>
                                <Text type="supporting">{access}</Text>
                            </Stack>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
