import ViewLayout from './ViewLayout';
import { Text } from '@astryxdesign/core/Text';
import { useLocation, useNavigate } from 'react-router';
import { Menu, MenuSection, MenuItem, MenuNavigationContext } from '@/components/ui/Menu';

/** Documents section navigation and selected content. */
export default function MenuPage() {
    // Render navigation guidance with separate component property tables.
    return (
        <ViewLayout
            name="Menu"
            isLongLinkSpecific
            properties={[
                {
                    name: 'children',
                    type: 'ReactNode',
                    description: 'MenuSection elements defining navigation and content.',
                },
                {
                    name: 'gap',
                    type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
                },
                {
                    name: 'MenuSection.children',
                    type: 'ReactNode',
                    description: 'MenuItem elements or nested MenuSubSection groups.',
                },
                {
                    name: 'MenuSection.isHeaderHidden',
                    type: 'boolean',
                    description: 'Hides the section heading; visible by default.',
                },
                {
                    name: 'MenuSection.title',
                    type: 'string',
                    description: 'Section heading displayed in the navigation.',
                },
                {
                    name: 'MenuItem.children',
                    type: 'ReactNode',
                    description: 'Content mounted beside the navigation while this item is selected.',
                },
                {
                    name: 'MenuItem.icon',
                    type: 'StoneIconName',
                    description: 'Optional LongLink icon name displayed beside the label.',
                },
                {
                    name: 'MenuItem.label',
                    type: 'string',
                    description: "Navigation label; its lowercase, hyphenated form identifies the item's URL fragment.",
                },
                {
                    name: 'MenuSubSection.children',
                    type: 'ReactNode',
                    description: 'MenuItem elements nested inside this collapsible group.',
                },
                {
                    name: 'MenuSubSection.icon',
                    type: 'StoneIconName',
                    description: 'Optional LongLink icon name displayed beside the group label.',
                },
                {
                    name: 'MenuSubSection.label',
                    type: 'string',
                    description: 'Label displayed on the collapsible navigation group.',
                },
            ]}
            introduction="Menu combines section navigation with the selected section’s content using Astryx SideNav. At View viewport widths of 768px and below, navigation moves above content rather than competing for its width. Resizing keeps the active content mounted; changing sections mounts only the selected section."
            examples={[
                {
                    title: 'Menu',
                    preview: <MenuExample />,
                    code: `function Example() {
  return (
    <Menu>
      <MenuSection title="Settings">
        <MenuItem label="Profile">
          <Text>Profile settings</Text>
        </MenuItem>
        <MenuItem label="Workflow">
          <Text>Workflow settings</Text>
        </MenuItem>
      </MenuSection>
    </Menu>
  );
}`,
                },
            ]}
        />
    );
}

/** Demonstrates the page's settings menu with switchable content. */
function MenuExample() {
    const location = useLocation();
    const navigate = useNavigate();

    // Keep router-backed fragment navigation local to the native preview, separate from the sandbox provider.
    return (
        <MenuNavigationContext
            value={{
                hash: location.hash,
                select: (id) => {
                    void navigate({
                        pathname: location.pathname,
                        search: location.search,
                        hash: `#${id}`,
                    });
                },
            }}
        >
            <Menu>
                <MenuSection title="Settings">
                    <MenuItem label="Profile">
                        <Text>Profile settings</Text>
                    </MenuItem>
                    <MenuItem label="Workflow">
                        <Text>Workflow settings</Text>
                    </MenuItem>
                </MenuSection>
            </Menu>
        </MenuNavigationContext>
    );
}
