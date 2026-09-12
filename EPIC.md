# Agent Error Lens Epics

Last reviewed: 2026-09-13

Status axes are independent:

- Planned: scope and acceptance are documented.
- Implemented: repository code exists.
- Verified: applicable checks have passed against that code/artifact.
- Released: an exact version is published and independently read back.

## E0 — Contract hardening

Outcome: freeze the smallest safe public contract before parser development.

Scope:

- input and result schemas;
- diagnostic, producer, evidence, issue, warning, truncation, and stats types;
- parser versus producer outcome semantics;
- stable ID, deduplication, ordering, null, Unicode, and serialization rules;
- offset mapping, redaction, path, work-budget, CLI exit, package, and compatibility decisions.

Acceptance:

- executable schema and TypeScript types have one source of truth;
- Golden contract examples validate;
- unresolved public decisions are closed or explicitly deferred;
- architecture review confirms no reasoning/execution responsibility leaked into the package.

State: Implemented contract artifacts; contract verification passed; parser/package capabilities are not implemented or released.

## E1 — Bounded input and normalization core

Outcome: turn untrusted artifacts into a bounded parse view with reversible evidence mapping.

Scope:

- request validation;
- deterministic work budgets;
- UTF-8/decoded string and newline handling;
- ANSI and terminal normalization;
- raw-to-normalized offset mapping;
- lexical path containment.

Acceptance:

- all fixed and secondary work budgets are enforced deterministically;
- normalized evidence maps to exact raw artifact ranges;
- malformed, excessive, unsupported, and outside-root inputs fail closed;
- processing performs no network, subprocess, or repository writes.

State: Planned and dependency-ready after the frozen contract and package scaffold; not implemented, verified, or released.

## E2 — V0.1 producer adapters

Outcome: extract evidence-backed candidates from the approved V0.1 producer set.

Scope:

- generic structured diagnostics;
- TypeScript;
- Vitest;
- ESLint;
- conservative generic text fallback;
- mixed/nested producer attribution.

Acceptance:

- every adapter has positive, negative, malformed, multiline, ANSI, and bounded fixtures;
- exact producer syntax and generic heuristic confidence are separated;
- generic patterns never produce `confirmed`;
- unsupported segments remain explicit.

State: Planned; not implemented, verified, or released.

## E3 — Canonicalization and output safety

Outcome: produce minimal, byte-stable, sanitized canonical diagnostics.

Scope:

- normalized severities, phases, messages, codes, locations, and producers;
- secret redaction;
- stable diagnostic IDs;
- deterministic deduplication and evidence union;
- stable ordering, summaries, stats, issues, warnings, and truncation;
- canonical JSON serialization.

Acceptance:

- repeated process runs produce byte-identical output;
- deduplication preserves all distinct evidence;
- secret fixtures do not leak through output, IDs, warnings, snapshots, or errors;
- truncation and uncertainty cannot appear complete or confirmed.

State: Planned; not implemented, verified, or released.

## E4 — Library, CLI, and package

Outcome: expose one core implementation through safe library and CLI interfaces.

Scope:

- library `parse` and `capabilities`;
- CLI `parse` and `capabilities`;
- stdin/stdout/stderr and exit-code behavior;
- npm exports, declarations, executable mapping, package contents, and compatibility;
- dependency and license review.

Acceptance:

- CLI and library canonical results are equivalent;
- producer failure cannot become an Error Lens process failure;
- clean consumers can import the packed library and run the packed CLI;
- package metadata and contents match the approved contract.

State: Package scaffold implemented; scaffold checks verified; V0.1 parser/interface behavior is not complete or released.

## E5 — Verification and release evidence

Outcome: prove the source, package, and released artifact independently.

Scope:

- static, unit, fixture, determinism, security, resource, parity, and agent-facing E2E checks;
- approved cross-platform Node/OS CI matrix;
- tarball and clean-install verification;
- release documentation and rollback guidance;
- tag, release, registry, integrity, and `gitHead` readback.

Acceptance:

- all applicable rows in the verification matrix pass at exact HEAD;
- the packed artifact passes independent consumer and CLI smoke tests;
- version, tag, release, and registry evidence agree;
- `PROGRESS.md` separately records Implemented, Verified, and Released state.

State: Planned; not implemented, verified, or released.

## Dependency order

```text
E0 Contract
  -> E1 Bounded core
  -> E2 Adapters
  -> E3 Canonical output safety
  -> E4 Interfaces/package
  -> E5 Verification/release
```

Some fixture design may begin during E0, but producer implementation must not outrun the public contract.
