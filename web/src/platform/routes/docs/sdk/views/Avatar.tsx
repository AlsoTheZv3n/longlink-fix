import ViewLayout from './ViewLayout';
import { Avatar } from '@/components/ui/Avatar';

/** Documents Avatar in LongLink Views. */
export default function AvatarPage() {
    // Render this component's authored examples in the shared documentation layout.
    return (
        <ViewLayout
            name="Avatar"
            introduction={'Uses local Waves fallbacks for rounded organization avatars and Glyphs for users.'}
            properties={[
                {
                    name: 'shape',
                    type: '"circle" | "square" | "rounded"',
                    description:
                        "Shape variant of the avatar. 'circle' stays fully round. 'rounded' uses the element radius token so it matches UI corner rounding and can be set globally via theme. 'square' has no radius. Status dot positioning adapts automatically: 4-o'clock on circle, bottom-right corner on rounded/square.",
                },
                {
                    name: 'name',
                    type: 'string',
                    description: 'User name for initials and alt text.',
                },
                {
                    name: 'seed',
                    type: 'string',
                    description: 'Stable identity for generated avatars, independent of the display name.',
                },
                {
                    name: 'kind',
                    type: '"user" | "organization"',
                    description:
                        'Organization owners use rounded Waves avatars; user owners retain the supplied geometry or a circle.',
                },
                {
                    name: 'src',
                    type: 'string | null',
                    description: 'Primary image source URL.',
                },
                {
                    name: 'alt',
                    type: 'string',
                    description: 'Alt text (falls back to name).',
                },
                {
                    name: 'size',
                    type: '"sm" | "lg" | "md"',
                    description:
                        "Avatar size. Use a named size or a numeric pixel value. Avatar shares Icon's abbreviated scale, but its tiers are larger because avatars align with media rather than glyphs. Inside an AvatarGroup the group's size wins and this prop is ignored.",
                },
            ]}
            examples={[
                {
                    title: 'Avatar',
                    preview: <AvatarExample />,
                    code: `function Example() {
  return <Avatar name="Ada Lovelace" />;
}`,
                },
            ]}
        />
    );
}

/** Renders the page's avatar example for documentation and the catalog. */
export function AvatarExample() {
    // Display the sample user's generated avatar.
    return <Avatar name="Ada Lovelace" size="lg" />;
}
