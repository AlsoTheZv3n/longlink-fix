/**
 * Opens a building project's construction phases and example document checklists.
 * @param {ViewProps} props
 */
export default function Project({ params }) {
    // Keep phase selection local while the server supplies project state and checklist examples.
    const [phaseIndex, setPhaseIndex] = useState(null);
    const [project] = useApi(`/api/projects/${params.project}`);
    const [phases] = useApi('/api/phases');
    const phase = phaseIndex === null ? undefined : phases[phaseIndex];

    // Keep project context visible beside either progress or the selected phase's documents.
    return (
        <Stack gap={4} paddingInline={8} paddingBlock={2}>
            <Stack direction="horizontal" align="center" justify="between" gap={2} wrap="wrap">
                {phase ? (
                    <Stack gap={0}>
                        <Heading level={1}>{phase.label}</Heading>
                        <Text type="supporting">{phase.description}</Text>
                    </Stack>
                ) : (
                    <Stack direction="horizontal" align="center" gap={2}>
                        <Stack width="var(--size-element-lg)">
                            <Image src={`/api/demo/photos/${project.photo}`} alt={`${project.name} building`} />
                        </Stack>
                        <Stack gap={0}>
                            <Heading level={1}>{project.name}</Heading>
                            <Text type="supporting">{project.description}</Text>
                        </Stack>
                    </Stack>
                )}
                <Button
                    label={phase ? 'Back to project' : 'Back to projects'}
                    variant="ghost"
                    onClick={() => {
                        // Return from a checklist to its project, or from the project to the gallery.
                        if (phase) setPhaseIndex(null);
                        else navigate('/projects');
                    }}
                />
            </Stack>
            <Divider />
            <Grid columns={3} collapseBelow={768} gap={8}>
                <GridSpan columns={2}>
                    {phase ? (
                        <Table
                            data={phase.documents}
                            idKey="name"
                            density="compact"
                            columns={[
                                {
                                    key: 'name',
                                    header: 'Document',
                                    width: proportional(1),
                                    renderCell: (document) => (
                                        <CheckboxInput
                                            label={document.name}
                                            size="sm"
                                            value={document.available}
                                            disabled
                                        />
                                    ),
                                },
                            ]}
                        />
                    ) : (
                        <Stepper activeStep={project.active_step} onStepClick={setPhaseIndex} orientation="vertical">
                            {phases.map((step, index) => (
                                <Step key={step.label} step={index} label={step.label} description={step.description} />
                            ))}
                        </Stepper>
                    )}
                </GridSpan>
                <Stack gap={2}>
                    <Stack align="start">
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
                    <Stack gap={2}>
                        <Text type="supporting">Project owner</Text>
                        <Stack direction="horizontal" align="center" gap={2}>
                            <Avatar name={project.owner} size="sm" />
                            <Stack gap={0}>
                                <Text>{project.owner}</Text>
                                <Text type="supporting">{project.owner_email}</Text>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Grid>
        </Stack>
    );
}
