# Agent Error Lens Roadmap

Roadmap status: Draft / Dependency-aware
Lifecycle: Pre-implementation MVP / Verification
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
- [x] Freeze executable input/output schemas and their TypeScript source of truth.
- [x] Freeze stable ID, deduplication, evidence-offset, path, redaction, ordering, and null rules.
- [x] Freeze CLI exit semantics, package/module format, Node/OS support, and package contents.
- [x] Complete architecture review and approve the V0.1 contract baseline.

Exit gate: public contracts are testable and no critical behavior remains implicit.

State: Complete for contract hardening; 5/5 acceptance items complete; downstream implementation and release proof are tracked later.

## M1 — Package and shared contract skeleton

Depends on: M0.

- [x] Add npm/package manifest and approved build/typecheck/lint configuration.
- [x] Integrate the authoritative schemas and checked TypeScript projection into the package with automated drift verification.
- [x] Add shared `parse` and `capabilities` core entry points.
- [x] Establish the zero-runtime-dependency baseline or record an approved exception.
- [x] Add the unit/fixture test harness and deterministic test environment.

Exit gate: source builds and contract examples validate without producer-specific parsing.

State: Complete for package scaffold; 5/5 acceptance items complete; producer-specific behavior is tracked and credited under M3 rather than this skeleton milestone.

T-002 adds the reviewed Golden/adversarial fixture inventory as a dependency-preparation artifact. The inventory itself is not capability credit; T-004 now supplies the bounded generic-structured implementation and tests that consume the relevant assertions.

## M2 — Bounded normalization foundation

Depends on: M1.

- [x] Implement request validation and all deterministic work-budget counters.
- [x] Implement newline/ANSI normalization with raw offset mapping.
- [x] Implement lexical Unix/Windows path handling and explicit-root containment.
- [x] Implement output redaction with benign-neighbor protections.
- [x] Implement generic structured diagnostic parsing.

Exit gate: bounded structured inputs produce evidence-resolvable sanitized results.

State: Complete for bounded generic-structured core; 5/5 acceptance items complete; producer-specific adapters are tracked in M3.

## M3 — V0.1 producer coverage

Depends on: M2.

- [x] Implement the TypeScript adapter and fixtures.
- [x] Implement the Vitest adapter and fixtures.
- [x] Implement the ESLint adapter and fixtures.
- [x] Implement the conservative generic text fallback and negative fixtures.
- [x] Implement deterministic mixed/nested producer attribution.

Exit gate: every approved producer family passes positive, negative, malformed, ANSI, multiline, and bound cases.

State: Complete for the approved V0.1 adapter matrix; 5/5 acceptance items complete; remaining verification and release proof are tracked later.

## M4 — Canonical interfaces and quality gates

Depends on: M3.

- [x] Implement stable IDs, deduplication, evidence union, ordering, and canonical serialization.
- [x] Implement summaries, stats, warnings, issues, status, and truncation semantics.
- [x] Implement CLI/library parity and real process exit-code tests.
- [x] Pass the complete producer, structural, failure, and determinism fixture matrix.
- [x] Pass security, path, resource-limit, and no-network/no-subprocess checks.
- [ ] Pass the approved Node/OS CI matrix and agent-facing E2E tests.

Exit gate: source behavior is implemented and verified at exact HEAD.

State: 5/6 complete for source-level canonical interfaces and local capability/resource/package behavior; remote Node/OS CI execution and independent agent E2E remain unverified.

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
| M0 contract/governance | 5 | 5 | 100% |
| M1 package skeleton | 5 | 5 | 100% |
| M2 normalization foundation | 5 | 5 | 100% |
| M3 producer coverage | 5 | 5 | 100% |
| M4 interfaces/quality | 5 | 6 | 83.3% |
| M5 release proof | 0 | 6 | 0% |
| V0.1 roadmap | 25 | 32 | 78.1% |

This percentage measures explicit roadmap acceptance items, not code volume or elapsed effort.

## Ecosystem sequencing

The company AI-Agent-Tools roadmap records Agent Error Lens at position 5 after Agent Test Scope at position 4. That sequence is an ecosystem planning dependency, not a runtime dependency. Local implementation and verification have progressed through safety/package gates; company status should be synchronized before external roadmap state is reported as active.

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
