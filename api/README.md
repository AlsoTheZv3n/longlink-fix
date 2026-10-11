<div align="center">

<img src="../banner.png" alt="LongLink banner" />

</div>

> [!WARNING]
> LongLink is under active development. APIs may change before 1.0.

<br />

## LongLink Platform API

LongLink provides the shared foundation for running Solutions.
The Platform API manages organizations, users, access,
deployments, and supporting infrastructure.

## Billing

Optional Stripe subscriptions automatically collect monthly per-member payments.
Billing is disabled by default.

Configure Stripe manually in test mode before enabling it:

1. Create an active CHF 5 monthly, licensed per-seat Team price. Use per-unit pricing without quantity transformations.
2. Create an active Customer Portal configuration for payment methods, invoices, and cancellation at period end. Disable subscription updates, including plan and quantity changes.
3. Register `https://<platform-host>/api/v1/billing/webhook` using the installed Stripe SDK's API version. Enable `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, and `invoice.payment_action_required`.
4. Supply `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_TEAM_PRICE_ID`, and `STRIPE_PORTAL_CONFIGURATION_ID` through the local environment or deployment secret manager. Never commit credentials. Set `PUBLIC_URL` to the public Platform origin.
5. Apply migrations and set `BILLING_ENABLED=true` in the sandbox deployment. Verify Checkout, seat changes, payment recovery, cancellation, and webhook retries before configuring separate live credentials and enabling live billing.

Existing Portal configurations must have subscription updates disabled. Configure tax policy and Stripe retry/email settings separately. Paid database expansion requires an expansion-capable storage driver; K3s local-path does not support it.

<br />

## Release

The API is published as a Linux AMD64 container image on GitHub Container
Registry.

| Name   | Image                        | Tag                        |
| ------ | ---------------------------- | -------------------------- |
| Stable | `ghcr.io/xlonglink/longlink` | `v<major>.<minor>.<patch>` |

<br />

---

<div align="center">
LongLink 2026

[License](../LICENSE) &nbsp; - &nbsp; [Contributing](../CONTRIBUTING.md) &nbsp; - &nbsp; [Code of Conduct](../CODE_OF_CONDUCT.md) &nbsp; - &nbsp; [Contact](mailto:info@longlink.dev)

</div>

---
