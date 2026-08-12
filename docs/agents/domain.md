# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo is a **multi-context pnpm monorepo** — each package under `packages/*` is its own context.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — it points at one `CONTEXT.md` per context (per package). Read each one relevant to the topic.
- **`docs/adr/`** at the repo root — system-wide decisions that cut across packages.
- **`packages/<name>/docs/adr/`** — context-scoped decisions for that package. Also check `packages/<name>/docs/` more broadly (several packages already keep a brief or design doc there, e.g. `packages/design-system/docs/DESIGN.md`).

If any of these files don't exist yet, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── CONTEXT-MAP.md
├── docs/adr/                                  ← system-wide decisions
└── packages/
    ├── design-system/
    │   ├── docs/
    │   │   ├── CONTEXT.md
    │   │   ├── DESIGN.md                       ← cross-package component usage, consulted separately per CLAUDE.md
    │   │   └── adr/                            ← context-specific decisions
    │   └── src/
    ├── assistant-shopping/
    │   ├── docs/CONTEXT.md
    │   └── docs/adr/
    ├── form-mealz-planner/
    │   ├── docs/CONTEXT.md
    │   └── docs/adr/
    ├── home/
    │   ├── docs/CONTEXT.md
    │   └── docs/adr/
    ├── marmiton-prototype/
    │   ├── docs/CONTEXT.md
    │   └── docs/adr/
    └── supermarket/
        ├── docs/CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant package's `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR (system-wide or package-scoped), surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
