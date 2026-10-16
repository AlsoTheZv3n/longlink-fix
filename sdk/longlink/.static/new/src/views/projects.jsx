/** Displays the landing-page building projects as an interactive gallery. */
export default function Projects() {
    // Load the same records used by the project table.
    const [projects] = useApi('/api/projects');

    // Keep project photos, state, and descriptions visible before opening their phases.
    return (
        <Stack gap={4} paddingInline={8} paddingBlock={2}>
            <Stack gap={0}>
                <Heading level={1}>Projects</Heading>
                <Text color="secondary">This can be used for tracking projects in a gallery.</Text>
            </Stack>
            <Grid columns={{ minWidth: 200, max: 4 }} gap={2} align="stretch">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        href={`/projects/${project.id}`}
                        label={project.name}
                        variant="muted"
                        padding={0}
                        height="100%"
                        isClipped
                    >
                        <Stack gap={0} height="100%">
                            <Image src={`/api/demo/photos/${project.photo}`} alt={`${project.name} building`} />
                            <StackItem size="fill">
                                <Stack gap={4} padding={3} height="100%" justify="between">
                                    <Stack gap={0} align="start">
                                        <Text as="h2" type="label" maxLines={1}>
                                            {project.name}
                                        </Text>
                                        <Badge
                                            label={project.status}
                                            variant={
                                                project.status === 'Completed'
                                                    ? 'success'
                                                    : project.status === 'In progress'
                                                      ? 'warning'
                                                      : 'neutral'
                                            }
                                        />
                                    </Stack>
                                    <Text type="supporting" maxLines={2}>
                                        {project.description}
                                    </Text>
                                </Stack>
                            </StackItem>
                        </Stack>
                    </Card>
                ))}
            </Grid>
            {projects.length === 0 && <EmptyState title="No projects yet" />}
        </Stack>
    );
}
