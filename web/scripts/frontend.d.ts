type ViewNode = React.JSX.Element | string | number | boolean | null | undefined | ViewNode[];
type ViewComponent<P> = (props: P & { children?: ViewNode }) => React.JSX.Element;
type ViewProps = { params: Readonly<Record<string, string>> };
type ViewJson = string | number | boolean | null | ViewJson[] | { [key: string]: ViewJson };
type ViewData = ViewJson | Blob;
type Spacing = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10;

/** @category Action @group Button */
type ViewMouseEvent = Omit<MouseEvent, 'currentTarget'> & { currentTarget: HTMLElement; nativeEvent: MouseEvent };

/** @category Action @group DropdownMenu */
type DropdownMenuItemData = {
    id?: string;
    label: ViewNode;
    icon?: StoneIconName;
    description?: ViewNode;
    endContent?: ViewNode;
    variant?: 'default' | 'destructive';
    isDisabled?: boolean;
    hasCloseOnSelect?: boolean;
    onClick?: () => void;
    items?: DropdownMenuOption[];
};

/** @category Action @group DropdownMenu */
type DropdownMenuOption =
    | DropdownMenuItemData
    | { type: 'divider' }
    | {
          type: 'section';
          id?: string;
          title?: string;
          items: DropdownMenuItemData[];
      };

/** @category Runtime */
declare namespace React {
    namespace JSX {
        interface Element {
            readonly type: unknown;
            readonly props: unknown;
        }

        interface ElementChildrenAttribute {
            children: unknown;
        }

        interface IntrinsicElements {
            [name: string]: Record<string, unknown>;
        }
    }
}

/** Groups JSX children without a DOM wrapper. @category Runtime @group Functions */
declare const Fragment: ViewComponent<{
    key?: string | number;
}>;

/**
 * Returns the current state and a setter. Pass a value or an initializer function; updates can use the previous state.
 * @category Runtime
 * @group Hooks
 */
declare function useState<T = undefined>(initial?: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void];

/**
 * Synchronizes with external systems after rendering. Return a cleanup function to release timers or subscriptions. Include every reactive value used by the effect in its dependencies.
 * @category Runtime
 * @group Hooks
 */
declare function useEffect(effect: () => void | (() => void), dependencies?: readonly unknown[]): void;

/**
 * Caches a calculated value until its dependencies change. Use it for expensive calculations, not required application state.
 * @category Runtime
 * @group Hooks
 */
declare function useMemo<T>(factory: () => T, dependencies: readonly unknown[]): T;

/**
 * Returns a stable object with a mutable current property. Changing current does not trigger a render.
 * @category Runtime
 * @group Hooks
 */
declare function useRef<T>(initial: T): { current: T };

/**
 * Navigates within the current Solution using a scoped path, or opens an HTTP(S) URL in a new tab. External URLs require user activation and open without an opener or referrer.
 * @category Runtime
 * @group Functions
 */
declare function navigate(path: string): void;

/**
 * Requests a Solution operation and returns its data. Options support the HTTP method, JSON, form data, and binary responses. Requests and responses are limited to 2,000,000 bytes, with at most 32 form entries and 8 pending operations. Successful writes automatically refresh cached View data. Failed HTTP requests reject with an Error containing an optional numeric status and a bounded client-facing message.
 * @category Runtime
 * @group Functions
 */
declare function request<T = unknown>(
    path: string,
    options?: {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        json?: unknown;
        form?: [string, string | Blob][];
        binary?: boolean;
    },
): Promise<T>;

/**
 * Returns Solution data and an awaitable invalidator scoped to the full request path. The renderer handles initial loading, errors, and retry.
 * @category Runtime
 * @group Hooks
 */
declare function useApi<T = unknown>(path: string): readonly [T, () => Promise<void>];

/** @category Form @group DateInput */
type ISODateString = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

/** @category Form @group TimeInput */
type ISOTimeString = string & { readonly __brand: 'ISOTimeString' };

/** @category Form @group Selector */
type SelectorOptionData = {
    value: string;
    label?: string;
    description?: ViewNode;
    icon?: StoneIconName;
    disabled?: boolean;
};

/** @category Form @group Selector */
type SelectorOptionType =
    | string
    | SelectorOptionData
    | { type: 'divider' }
    | {
          type: 'section';
          title?: string;
          options: SelectorOptionData[];
      };

/** @category Display @group Table */
type ColumnWidth = { type: 'proportional'; value: number; minWidth?: number } | { type: 'pixel'; value: number };
