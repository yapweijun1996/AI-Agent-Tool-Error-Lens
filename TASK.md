# Agent Error Lens Task Backlog

Last reviewed: 2026-09-13

Statuses: `Ready`, `In progress`, `Blocked`, `Done`. A task is `Done` only when its acceptance criteria and listed verification are satisfied. Product delivery axes remain separate in `PROGRESS.md`.

## Active backlog

| ID | Priority | Status | Task | Depends on | Done when | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| T-000 | P0 | Done | Establish eight Core SSOT documents | None | All files exist, agree on scope/status, and pass the documentation audit | Eight files; 32-item/10-task/prompt-length/fence/whitespace/status checks passed |
| T-001 | P0 | Ready | Freeze executable V0.1 contract | T-000 | Schemas/types/examples validate; IDs, offsets, redaction, paths, status, budgets, CLI exits, package and compatibility decisions are explicit | Tests and review required |
| T-002 | P0 | Planned | Build Golden and adversarial fixture corpus | T-001 | Required producer, structural, failure, security, determinism, and agent-facing fixtures exist with expected outputs | Fixture review required |
| T-003 | P0 | Planned | Scaffold npm library/CLI package | T-001 | Manifest, build, typecheck, lint, schema/type drift check, shared entry points, test harness, and dependency baseline pass | Executable verification required |
| T-004 | P0 | Planned | Implement bounded normalization core | T-002, T-003 | Validation, budgets, ANSI/newline mapping, paths, redaction, and generic structured parsing pass fixtures | Unit and integration evidence required |
| T-005 | P0 | Planned | Implement V0.1 producer adapters | T-004 | TypeScript, Vitest, ESLint, generic fallback, and mixed producer cases pass positive and negative fixtures | Adapter fixture evidence required |
| T-006 | P0 | Planned | Implement canonical output and interfaces | T-004, T-005 | IDs, dedup, ordering, serialization, summaries, statuses, CLI/library parity, and real exit codes pass | Repeated-process and parity evidence required |
| T-007 | P0 | Planned | Complete source and package verification | T-006 | Full matrix, cross-platform CI, tarball inspection, clean consumer import, packed CLI, and agent E2E pass | Exact-HEAD evidence required |
| T-008 | P1 | Planned | Prepare and verify first release | T-007 | Authorized version/tag/release/registry state agree and integrity plus `gitHead` readback pass | External release evidence required |
| T-009 | P1 | Planned | Synchronize project and company KB status | T-000, T-001 | One canonical status record reflects current design state without claiming implementation | KB readback required |

## T-001 — Current highest-value task

Goal: convert the Draft specification into an executable, reviewable contract before parser code.

Work:

1. Define one JSON Schema source of truth for request, result, producers, diagnostics, evidence, issues, warnings, truncation, summaries, and stats.
2. Decide whether TypeScript types are generated from or mechanically checked against that schema.
3. Freeze diagnostic ID hash prefix length and collision behavior.
4. Freeze deduplication identity, evidence union, null ordering, severity ordering, Unicode/newline policy, and canonical JSON key order.
5. Freeze UTF-16 raw offset mapping behavior for ANSI and CRLF transformations.
6. Freeze secondary work budgets for lines, matches, terminal sequences, producer candidates, and total evidence.
7. Freeze lexical path behavior for Unix, Windows, rootless, contained, escaping, and ambiguous paths.
8. Freeze redaction patterns, replacement format, benign-neighbor cases, and the rule that IDs use sanitized fields.
9. Freeze CLI usage, stdin, stdout/stderr, process exits, and producer-outcome behavior.
10. Select Node.js versions, ESM/CommonJS policy, package contents, license, and package-name verification procedure.

Verification:

- schema validation of all examples;
- compile-time type examples;
- negative schema fixtures;
- deterministic serialization examples;
- architecture/security review against `GOAL.md` and `DESIGN.md`;
- independent contradiction review across all eight Core SSOT files.

## Open decisions that do not block documentation

These are normal engineering decisions for T-001 and do not require user approval unless new evidence creates a material product trade-off:

- exact SHA-256 prefix length and collision response;
- secondary work-budget ceilings;
- schema-to-TypeScript generation direction;
- ESM/CommonJS packaging;
- supported Node.js/OS matrix;
- npm name availability and license choice;
- canonical null/severity ordering details.

## Known gaps and defects

- No source, manifest, README, CHANGELOG, ADR, tests, CI, release workflow, or runtime exists.
- The company KB status dated 2026-09-07 says design has not started; the fresher project report says Contract Hardening. T-009 must reconcile this without rewriting history.
- The earlier KB MVP envelope used a second top-level `diagnostics` collection. The current project report resolves this to `toolIssues`; implementation must follow the Core SSOT after T-001 review.
- Existing fixed byte/line/diagnostic limits are documented, but secondary deterministic work budgets are not yet selected.
- Node.js compatibility, module format, package allowlist, license, and npm registry availability are unverified.
- No browser/UI audit is applicable because this project has no user interface or running product.

## Definition of Done for any implementation task

An implementation task is complete only when:

- the smallest in-scope change is implemented;
- public contracts and architecture ownership remain consistent;
- targeted and affected regression checks pass;
- security, bounds, determinism, and failure cases are covered where applicable;
- package/runtime/release claims are verified at their own boundary;
- the final diff contains no unrelated work or secret material;
- `TASK.md`, `PROGRESS.md`, and affected Core SSOT documents are synchronized;
- a focused local commit is created; nothing is pushed or published without explicit authorization.
