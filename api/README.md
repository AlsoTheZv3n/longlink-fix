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

<br />

## Release

The API is published as a Linux AMD64 container image on GitHub Container
Registry.

| Name   | Image                        | Tag                        |
| ------ | ---------------------------- | -------------------------- |
| Stable | `ghcr.io/xlonglink/longlink` | `v<major>.<minor>.<patch>` |



<br />

## Develop the Platform

### Stripe

```bash
make stripe         # From the root folder
```

Use any future expiry, such as `12/30`, any three-digit CVC, such as `123`, and any test name and address.
See [Stripe's testing documentation](https://docs.stripe.com/testing) for more scenarios.

| Card number           |                                          |
| --------------------- | ------------------------------------------------ |
| `4242 4242 4242 4242` | Visa: successful registration and payments       |
| `5555 5555 5555 4444` | Mastercard: successful registration and payments |
| `4000 0000 0000 0341` | Can be saved, but subsequent payments decline    |



<br />

<br />

---

<div align="center">
LongLink 2026

[License](../LICENSE) &nbsp; - &nbsp; [Contributing](../CONTRIBUTING.md) &nbsp; - &nbsp; [Code of Conduct](../CODE_OF_CONDUCT.md) &nbsp; - &nbsp; [Contact](mailto:info@longlink.dev)

</div>

---
