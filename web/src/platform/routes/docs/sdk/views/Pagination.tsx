import { useState } from 'react';
import ViewLayout from './ViewLayout';
import { Pagination } from '@/components/ui/Pagination';

/** Documents shared pagination for Solution tables and galleries. */
export default function PaginationPage() {
    // Keep server queries and selected-page state in the Solution while sharing navigation controls.
    return (
        <ViewLayout
            name="Pagination"
            introduction="Pagination supplies page controls, bounds, and accessible navigation for tables or galleries. Pages start at 1. The Solution owns page state and data fetching; pass the total item count and page size returned or used by your API."
            examples={[
                {
                    title: 'Server pagination',
                    preview: <PaginationExample />,
                    code: `export default function Items() {
  const [page, setPage] = useState(1);
  const [items] = useApi(\`/api/items?page=\${page}&page_size=8\`);

  return (
    <Stack gap={4}>
      <Table data={items.items} idKey="id" />
      <Pagination page={page} onPageChange={setPage} totalItems={items.total} pageSize={8} />
    </Stack>
  );
}`,
                },
            ]}
        />
    );
}

/** Demonstrates controlled pagination without network requests. */
function PaginationExample() {
    // Let the shared controls own page bounds while retaining the selected page locally.
    const [page, setPage] = useState(1);

    return <Pagination page={page} onPageChange={setPage} totalItems={80} pageSize={8} />;
}
