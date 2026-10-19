import ViewLayout from './ViewLayout';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Heading';
import { Table, proportional } from '@astryxdesign/core/Table';

// Describe the runtime bindings exposed to Views.
const hooks = [
    {
        name: 'useState(initial)',
        description:
            'Returns the current state and a setter. Pass a value or an initializer function; updates can use the previous state.',
    },
    {
        name: 'useEffect(effect, dependencies)',
        description:
            'Synchronizes with external systems after rendering. Return a cleanup function to release timers or subscriptions. Include every reactive value used by the effect in its dependencies.',
    },
    {
        name: 'useMemo(factory, dependencies)',
        description:
            'Caches a calculated value until its dependencies change. Use it for expensive calculations, not required application state.',
    },
    {
        name: 'useRef(initial)',
        description:
            'Returns a stable object with a mutable current property. Changing current does not trigger a render.',
    },
    {
        name: 'useApi(path)',
        description:
            'Returns Solution data and an awaitable invalidator scoped to the full request path. The renderer handles initial loading, errors, and retry.',
    },
];

/** Documents the hooks exposed by the View runtime. */
export default function HooksPage() {
    // Render the runtime-specific hooks table.
    return (
        <ViewLayout
            name="Hooks"
            introduction="LongLink supplies these hooks directly in Views, without imports or a React. prefix. Call hooks at the top level of a component, never inside conditions or loops."
            toc={[{ id: 'hooks', label: 'Hooks', level: 2 }]}
        >
            <Heading id="hooks" level={2}>
                Hooks
            </Heading>
            <Table
                data={hooks}
                idKey="name"
                density="compact"
                columns={[
                    {
                        key: 'name',
                        header: 'Hook',
                        width: proportional(1),
                        renderCell: (hook) => (
                            <Stack gap={0}>
                                <Text>{hook.name}</Text>
                                <Text type="supporting">{hook.description}</Text>
                            </Stack>
                        ),
                    },
                ]}
            />
        </ViewLayout>
    );
}
