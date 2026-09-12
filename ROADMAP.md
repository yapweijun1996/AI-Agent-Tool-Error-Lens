# Agent Error Lens Roadmap

Roadmap status: Draft / Dependency-aware
Lifecycle: Pre-implementation MVP / Contract Hardening
Last reviewed: 2026-09-13

## Roadmap rules

- Milestones follow dependency order; later work may be prepared but cannot claim completion before its prerequisites.
- Planned, Implemented, Verified, and Released are tracked independently.
- A checked item requires repository or external evidence, not intent.
- The V0.1 progress denominator is the 32 acceptance items below.
- Scope additions require an explicit contract and roadmap change.

## M0 — Contract and governance baseline

Depends on: none.

- [x] Create and cross-check the eight Core SSOT documents.
- [ ] Freeze executable input/output schemas and their TypeScript source of truth.
- [ ] Freeze stable ID, deduplication, evidence-offset, path, redaction, ordering, and null rules.
- [ ] Freeze CLI exit semantics, package/module format, Node/OS support, and package contents.
- [ ] Complete architecture review and approve the V0.1 contract baseline.

Exit gate: public contracts are testable and no critical behavior remains implicit.

State: Planned in progress; 1/5 acceptance items complete; no product implementation.

## M1 — Package and shared contract skeleton

Depends on: M0.

- [ ] Add npm/package manifest and approved build/typecheck/lint configuration.
- [ ] Add authoritative schemas, generated or checked TypeScript types, and drift verification.
- [ ] Add shared `parse` and `capabilities` core entry points.
- [ ] Establish the zero-runtime-dependency baseline or record an approved exception.
- [ ] Add the unit/fixture test harness and deterministic test environment.

Exit gate: source builds and contract examples validate without producer-specific parsing.

State: Planned; 0/5 complete.

## M2 — Bounded normalization foundation

Depends on: M1.

- [ ] Implement request validation and all deterministic work-budget counters.
- [ ] Implement newline/ANSI normalization with raw offset mapping.
- [ ] Implement lexical Unix/Windows path handling and explicit-root containment.
- [ ] Implement output redaction with benign-neighbor protections.
- [ ] Implement generic structured diagnostic parsing.

Exit gate: bounded structured inputs produce evidence-resolvable sanitized results.

State: Planned; 0/5 complete.

## M3 — V0.1 producer coverage

Depends on: M2.

- [ ] Implement the TypeScript adapter and fixtures.
- [ ] Implement the Vitest adapter and fixtures.
- [ ] Implement the ESLint adapter and fixtures.
- [ ] Implement the conservative generic text fallback and negative fixtures.
- [ ] Implement deterministic mixed/nested producer attribution.

Exit gate: every approved producer family passes positive, negative, malformed, ANSI, multiline, and bound cases.

State: Planned; 0/5 complete.

## M4 — Canonical interfaces and quality gates

Depends on: M3.

- [ ] Implement stable IDs, deduplication, evidence union, ordering, and canonical serialization.
- [ ] Implement summaries, stats, warnings, issues, status, and truncation semantics.
- [ ] Implement CLI/library parity and real process exit-code tests.
- [ ] Pass the complete producer, structural, failure, and determinism fixture matrix.
- [ ] Pass security, path, resource-limit, and no-network/no-subprocess checks.
- [ ] Pass the approved Node/OS CI matrix and agent-facing E2E tests.

Exit gate: source behavior is implemented and verified at exact HEAD.

State: Planned; 0/6 complete.

## M5 — Package and release proof

Depends on: M4.

- [ ] Finalize README, CHANGELOG, license, compatibility, and release/rollback instructions.
- [ ] Inspect the npm tarball allowlist, declarations, exports, bin, source maps, and integrity.
- [ ] Pass clean-install consumer import and packed CLI smoke tests.
- [ ] Pass exact-HEAD release CI with no unexplained failures.
- [ ] Create an authorized SemVer tag and release only after all gates pass.
- [ ] Read back registry version, dist integrity, `gitHead`, tag, and release agreement.

Exit gate: the exact verified artifact is independently confirmed as released.

State: Planned; 0/6 complete.

## Explicit progress

| Scope | Completed | Total | Progress |
| --- | ---: | ---: | ---: |
| M0 contract/governance | 1 | 5 | 20.0% |
| M1 package skeleton | 0 | 5 | 0% |
| M2 normalization foundation | 0 | 5 | 0% |
| M3 producer coverage | 0 | 5 | 0% |
| M4 interfaces/quality | 0 | 6 | 0% |
| M5 release proof | 0 | 6 | 0% |
| V0.1 roadmap | 1 | 32 | 3.1% |

This percentage measures explicit roadmap acceptance items, not code volume or elapsed effort.

## Ecosystem sequencing

The company AI-Agent-Tools roadmap records Agent Error Lens at position 5 after Agent Test Scope at position 4. That sequence is an ecosystem planning dependency, not a runtime dependency. Local contract hardening can proceed independently; implementation start and company status should be synchronized before either is reported as active.

## Deferred V0.2+ candidates

- Jest specialization;
- Node.js native test specialization;
- `explain` and public `normalize`;
- advanced grouping;
- plugin architecture;
- streaming;
- runtime trace or CI platform correlation;
- semantic explanation and root-cause recommendations.

Deferred work has no progress credit in V0.1.
