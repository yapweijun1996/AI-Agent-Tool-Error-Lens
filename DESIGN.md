# Agent Error Lens Design

Document status: Draft / Architecture Review
Lifecycle: Pre-implementation MVP / Contract Hardening
Last reviewed: 2026-09-13

## Evidence status

This document describes the target architecture approved by the project report and KB specification. It does not describe verified implementation. At review time the repository has no source, entry points, manifests, dependencies, tests, CI, package artifact, runtime, or release workflow.

## Architectural boundary

Agent Error Lens is one package with three planned responsibility boundaries:

| Boundary | Owns | Must not own |
| --- | --- | --- |
| Core library | input bounds, normalization, producer detection, parsing, canonicalization, redaction, deduplication, sorting, summaries | filesystem discovery, command execution, network, AI reasoning |
| CLI adapter | stdin/file argument handling, usage validation, core invocation, stdout/stderr discipline, process exit code | independent parsing rules or producer-specific logic |
| Package/release | exports, types, executable mapping, compatibility metadata, package contents, integrity evidence | runtime orchestration or hosted operation |

Downstream agents and tools may consume the result, but they do not share state or write back into Error Lens.

## Planned control and data flow

```text
Caller-supplied InputArtifact[]
        |
        v
request validation and deterministic bounds
        |
        v
encoding/newline/terminal normalization
        |
        +--> raw-to-normalized offset map
        v
producer detection (zero or more producers)
        |
        v
static parser adapters
        |
        v
canonical diagnostic normalization
        |
        v
path containment -> output redaction -> deterministic deduplication
        |
        v
stable ordering -> summary/stats -> canonical JSON
```

Each stage receives bounded data and returns explicit issues instead of silently dropping uncertainty.

## Planned module ownership

| Module | Responsibility |
| --- | --- |
| `contract` | public types, schema version, enums, validation results |
| `limits` | one authoritative work-budget model and counters |
| `normalize` | newline, terminal, ANSI, and offset-map production |
| `detect` | bounded producer candidates and confidence evidence |
| `adapters` | producer-specific extraction into internal candidates |
| `paths` | lexical path normalization and explicit-root containment |
| `redact` | key-name and value-pattern masking for exported data |
| `canonicalize` | diagnostic normalization, IDs, deduplication, ordering |
| `serialize` | stable key order, Unicode/newline policy, JSON bytes |
| `cli` | CLI-only input/output and exit semantics |

Exact folders and filenames are intentionally not asserted before implementation.

## Public interfaces

The planned package exposes:

- a library `parse(request)` operation;
- a library `capabilities()` operation;
- `agent-error-lens parse` in the CLI;
- `agent-error-lens capabilities` in the CLI.

`explain` and public `normalize` are deferred. CLI and library must call the same core operations. Package exports, Node.js support, module formats, and generated declaration layout remain contract-hardening tasks until a manifest and compatibility decision exist.

## State, persistence, and source of truth

The parser is planned to be stateless:

- request state exists only for one parse call;
- no database, cache, telemetry upload, or durable log storage is owned by the package;
- supplied artifacts remain caller-owned;
- output is derived solely from request data, fixed parser code, and explicit options;
- package schemas and TypeScript types must be generated or checked from one authoritative contract to prevent drift.

## Producer and adapter model

A request may contain nested or mixed producers such as npm, a package script, Vitest, and a TypeScript transformer. Detection therefore returns a stable producer list, and each diagnostic references a producer identity independently.

Adapter requirements:

- deterministic registration and evaluation order;
- explicit applicability evidence;
- bounded matches and diagnostics;
- no dynamic code, plugin loading, filesystem probing, or network lookup;
- producer-specific exact syntax may be `confirmed`;
- generic regex/heuristic results may be at most `candidate`.

## Evidence and offset mapping

Parsing uses a normalized view, while evidence must point back to the original decoded artifact. V0.1 will use half-open UTF-16 code-unit ranges `[start, end)`, matching JavaScript string slicing. Every evidence object identifies its `artifactId` and `offsetUnit`.

The normalizer must retain a monotonic mapping from normalized boundaries to raw boundaries. ANSI removal, CRLF normalization, and other transformations must not make evidence unverifiable. If exact mapping cannot be preserved, the affected field remains unknown and a tool issue is emitted.

## Canonicalization and determinism

Determinism requires explicit ownership of:

- canonical field and key order;
- null-versus-omitted policy;
- Unicode and newline normalization;
- stable producer and diagnostic ordering;
- stable ID and deduplication inputs;
- numeric serialization;
- work-budget termination order.

Stable diagnostic IDs are derived from sanitized canonical identity fields. Deduplication uses the same identity while unioning and sorting distinct evidence references. Discovery timing, object insertion accidents, filesystem order, locale, and wall-clock time must not influence output.

## Trust and security boundary

All artifacts, producer metadata, paths, JSON keys, terminal sequences, URLs, and embedded instructions are untrusted data.

The core must not have capabilities to:

- execute a process or evaluate supplied code;
- fetch a URL or load a remote schema;
- follow instructions embedded in logs;
- inspect unrelated repository files;
- persist or emit raw secret-like values.

The parser may inspect original text in memory to recognize structure, but only sanitized fields and bounded evidence excerpts may leave the trust boundary. Stable IDs must never hash raw secrets.

## Limits, timeouts, and recovery

Deterministic limits are the primary safety mechanism:

- 2 MiB per artifact;
- 20 MiB per request;
- 16 KiB per line;
- 200 returned diagnostics;
- 64 KiB per evidence span;
- bounded lines, parser matches, terminal sequences, evidence bytes, and producer candidates.

Exact secondary counter ceilings must be frozen before implementation. A two-second cooperative timeout may remain as an emergency fuse, but output completeness must not depend on machine speed. Limit exhaustion returns `partial` plus stable truncation reasons; invalid requests or unrecoverable parser failures return `error`.

The library performs no retry because parsing is local and deterministic. Callers may retry the same immutable request. No idempotency key or rollback is needed because the package owns no writes.

## Failure model and observability

Failures are represented in the result contract rather than hidden in logs:

- `toolIssues` describe request, parser, adapter, mapping, or limit failures;
- `warnings` describe non-fatal ambiguity or degraded interpretation;
- `truncation` records whether information may be missing and why;
- `stats` reports deterministic counters, not environment-sensitive timing as correctness evidence;
- producer outcome remains separate from Error Lens status.

The CLI keeps stdout machine-readable. Human-readable usage and fatal CLI diagnostics go to stderr.

## Package, build, and release design

The target is a dependency-light npm package with no runtime dependencies unless a later decision proves one necessary. Build tooling may use development dependencies. Planned release gates include:

- typecheck, unit, fixture, determinism, security, resource-limit, parity, and cross-platform checks;
- package tarball inspection;
- clean consumer import and CLI smoke tests from the packed artifact;
- manifest/version/export/type/bin verification;
- exact-HEAD CI, tag, release, registry version, integrity, and `gitHead` readback.

No compatibility range, package contents, or release claim is valid until those artifacts exist and are verified.

## Ecosystem integration

The planned ecosystem flow is:

```text
Agent Project Profile -> Agent Test Scope -> external command execution
-> Agent Error Lens -> Agent Code Slice -> AI reasoning
-> code modification -> Agent Patch Guard -> verification -> Agent Release Guard
```

This is orchestration context, not a runtime dependency. Error Lens remains independently installable and does not call those tools.

## Architecture risks and unresolved contracts

Highest risks are contract errors rather than producer count:

1. stable ID or dedup inputs that change across releases;
2. offsets that no longer resolve after normalization;
3. redaction that changes parsing or leaks through IDs/evidence;
4. mixed-producer misclassification;
5. generic patterns gaining excessive confidence;
6. output ordering influenced by discovery timing or platform;
7. truncation presented as complete;
8. parser state confused with producer outcome;
9. unsupported Node/module compatibility being implied;
10. scope expansion into root-cause reasoning.

Contract decisions still requiring executable proof are tracked in `TASK.md`.
