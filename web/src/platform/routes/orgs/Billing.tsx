import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks/use-api';
import { Text } from '@astryxdesign/core/Text';
import { Stack } from '@astryxdesign/core/Stack';
import { Token } from '@astryxdesign/core/Token';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Heading } from '@astryxdesign/core/Heading';
import * as schemas from '@/lib/generated/platform-api-v1/zod.gen';

/** Shows subscription controls inside the existing 260px settings navigation and flexible content region. */
export default function Billing({ base, canManage }: { base: string; canManage: boolean }) {
    // Read server-confirmed payment state; redirect query parameters never grant paid access.
    const [billing, invalidate] = useApi(`${base}/billing`, schemas.zBillingResponse);

    /** Starts a hosted Stripe flow with only a supported plan selection. */
    async function openStripe(planId?: 'team') {
        // Stripe URLs are validated by the generated API schema before leaving LongLink.
        const response = await api
            .post(
                `${base}/billing/${planId ? 'checkout' : 'portal'}`,
                planId ? { json: schemas.zCheckoutRequest.parse({ plan: planId }) } : undefined
            )
            .json(schemas.zBillingRedirect);

        // Redirect only after receiving the validated hosted session.
        window.location.assign(response.url);
    }

    // Reuse the settings shell rather than introducing a second page layout or empty invoice tables.
    return (
        <Stack gap={4}>
            <Stack direction="horizontal" align="center" justify="between" gap={3}>
                <Heading level={2}>Billing</Heading>
                <Button label="Refresh" variant="ghost" clickAction={invalidate} />
            </Stack>
            <Divider />
            <Heading level={3}>LongLink {billing.plan === 'team' ? 'Team' : 'Free'}</Heading>
            <Stack direction="horizontal" align="center" wrap="wrap" gap={2}>
                <Text>
                    {billing.seats} billable {billing.seats === 1 ? 'seat' : 'seats'}
                </Text>
                <Token
                    label={billing.status.replaceAll('_', ' ')}
                    color={billing.payment_required ? 'orange' : 'default'}
                />
            </Stack>
            {billing.cancel_at_period_end && (
                <Text as="p" role="status">
                    Subscription ends{' '}
                    {billing.period_end
                        ? new Date(billing.period_end).toLocaleDateString()
                        : 'at the end of the billing period'}
                    .
                </Text>
            )}
            {billing.payment_required && (
                <Text as="p" role="status">
                    Payment requires attention. New members cannot join until billing is resolved.
                </Text>
            )}
            {billing.seat_limit !== null && billing.seats >= billing.seat_limit && (
                <Text as="p">
                    The Free plan allows {billing.seat_limit} members. Upgrade or remove a member before inviting more.
                    Existing access is preserved.
                </Text>
            )}
            {!billing.enabled ? (
                <Text as="p" color="secondary">
                    Paid billing is not enabled on this deployment.
                </Text>
            ) : canManage ? (
                <Stack direction="horizontal" wrap="wrap" gap={2}>
                    {billing.subscribed ? (
                        <Button
                            label="Manage subscription and invoices"
                            variant="primary"
                            clickAction={() => openStripe()}
                        />
                    ) : (
                        <Button label="Upgrade to Team" variant="primary" clickAction={() => openStripe('team')} />
                    )}
                </Stack>
            ) : (
                <Text as="p" color="secondary">
                    An organization owner can manage billing.
                </Text>
            )}
            <Text as="p" type="supporting">
                All accepted members count as seats, including read-only members. Invitations are not billed. Stripe
                collects monthly payments automatically; added seats are prorated and removed seats reduce the next
                renewal without an immediate refund.
            </Text>
        </Stack>
    );
}
