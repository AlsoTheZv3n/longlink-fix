<div align="center">

# Solution Template

Build a process-specific business application. \
All the data, logic and configurations are defined as code. \
Use your favorite AI tool with full context on the solution.

</div>

<br />

## Getting Started

Install [uv](https://docs.astral.sh/uv/getting-started/installation/) to get started

```bash
uv sync
uv run longlink dev
```

The starter expands the landing-page construction demo with twelve building projects,
a photo gallery, a compact project table, and project details with six phases and
read-only example document checklists. One initial migration creates the project
table and seeds examples across every construction phase in every environment;
the photos are bundled and served by the Solution.

Project contacts and document availability are illustrative. Settings are local
to the current View session and do not enforce approval or notification rules.

<br />

## Migrate changes

After changing database models, generate and apply a new migration:

```bash
uv run longlink migrate
```

<br />

## Release

```bash
git fetch origin main
git tag v0.0.0 origin/main
git push origin v0.0.0
```

<br />

---

<div align="center">
LongLink 2026

</div>

---
