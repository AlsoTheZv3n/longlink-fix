import { Pagination as AstryxPagination } from '@astryxdesign/core/Pagination';

/** Navigates pages of table or gallery items without owning their data or selection. */
export function Pagination(props: {
    /** Hides the component without unmounting it. */
    hidden?: boolean;
    /** Current page number, starting at 1. */
    page: number;
    /** Receives the selected page number. */
    onPageChange: (page: number) => void;
    totalItems: number;
    pageSize: number;
    /** Accessible navigation label; defaults to Astryx's localized Pagination label. */
    label?: string;
}) {
    // Delegate page counts, navigation controls, and accessibility to Astryx.
    return (
        <AstryxPagination
            hidden={props.hidden}
            className={props.hidden ? 'hidden!' : undefined}
            page={props.page}
            onChange={props.onPageChange}
            totalItems={props.totalItems}
            pageSize={props.pageSize}
            label={props.label}
        />
    );
}
