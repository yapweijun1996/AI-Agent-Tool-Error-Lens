# Agent Error Lens V0.1 Specification

Specification status: Draft / Contract Hardening
Target release: Unreleased `0.1.0`
Last reviewed: 2026-09-13

Normative terms `MUST`, `MUST NOT`, `SHOULD`, and `MAY` describe the intended V0.1 contract. Nothing in this document is an implementation or release claim.

## 1. V0.1 scope

V0.1 MUST provide:

- TypeScript compiler diagnostics;
- Vitest diagnostics;
- ESLint diagnostics;
- documented generic structured diagnostic input;
- conservative generic text fallback;
- library `parse` and `capabilities` operations;
- CLI `parse` and `capabilities` commands.

Jest specialization, Node.js native test specialization, `explain`, public `normalize`, streaming, plugins, CI adapters, runtime correlation, semantic explanation, and root-cause recommendations are deferred.

## 2. Input request

```ts
interface ParseRequest {
  schemaVersion: "1";
  artifacts: InputArtifact[];
  producerOutcome?: ProducerOutcome;
  options?: ParseOptions;
}

interface InputArtifact {
  id: string;
  stream: "stdout" | "stderr" | "combined" | "unknown";
  content: string;
  encoding?: "utf-8";
}

interface ProducerOutcome {
  command?: string;
  exitCode?: number | null;
  signal?: string | null;
}

interface ParseOptions {
  root?: string;
}
```

Requirements:

- `schemaVersion`, `artifacts`, artifact `id`, `stream`, and `content` MUST be validated before parsing.
- Artifact IDs MUST be unique within a request.
- Array order is authoritative artifact order.
- V0.1 accepts decoded strings and UTF-8 CLI input only.
- Unknown fields MUST NOT change parsing semantics and SHOULD be reported or preserved only where the schema explicitly permits them.
- `producerOutcome` is caller-supplied evidence and MUST remain separate from parser status.
- `root` enables lexical repository-relative path containment; omission MUST NOT imply the current working directory.

## 3. Result envelope

```ts
interface ParseResult {
  schemaVersion: "1";
  status: "complete" | "partial" | "error";
  producerOutcome?: ProducerOutcome;
  data: {
    producers: Producer[];
    diagnostics: Diagnostic[];
    summary: Summary;
  };
  toolIssues: ToolIssue[];
  warnings: Warning[];
  truncation: {
    truncated: boolean;
    reasons: TruncationReason[];
  };
  stats: ParseStats;
}
```

`data.diagnostics` is the only diagnostic collection. `toolIssues` MUST be used for Error Lens request, parser, adapter, mapping, or limit issues.

Status semantics:

- `complete`: all supplied input was processed within budgets; zero diagnostics is valid.
- `partial`: a valid result exists, but a limit, truncation, unsupported segment, or recoverable parser issue means additional information may exist.
- `error`: the request is invalid or no trustworthy result can be produced.

A producer exit code other than zero MUST NOT force Error Lens status to `partial` or `error`.

## 4. Diagnostic contract

```ts
interface Diagnostic {
  id: string;
  severity: "error" | "warning" | "info" | "unknown";
  phase: "compile" | "test" | "lint" | "build" | "cli" | "unknown";
  message: string;
  code: string | null;
  location: Location | null;
  producerId: string | null;
  confidence: "confirmed" | "strong" | "candidate" | "unknown";
  evidence: Evidence[];
}

interface Location {
  file: string;
  line: number | null;
  column: number | null;
}

interface Evidence {
  artifactId: string;
  kind: "log-span" | "structured-field";
  start: number;
  end: number;
  offsetUnit: "utf16-code-unit";
}
```

Requirements:

- Lines and columns are one-based when known.
- Evidence ranges are half-open `[start, end)` offsets into the original decoded artifact.
- `content.slice(start, end)` MUST identify the supporting raw span for `utf16-code-unit` evidence.
- Missing fields MUST remain `null` according to the canonical null policy; they MUST NOT be guessed.
- Messages and all exported strings MUST be sanitized.
- Every non-unknown diagnostic SHOULD have at least one evidence reference; missing evidence MUST reduce confidence and produce a warning or issue.

## 5. Producer model

```ts
interface Producer {
  id: string;
  name:
    | "typescript"
    | "vitest"
    | "eslint"
    | "generic-structured"
    | "generic-text"
    | "unknown";
  version: string | null;
  evidence: Evidence[];
}
```

A request MAY contain multiple producers. Each diagnostic references its producer independently. Producer IDs and ordering MUST be deterministic. A wrapper such as npm MUST NOT erase the nested producer that supplied the diagnostic syntax.

## 6. Confidence model

| Level | Meaning |
| --- | --- |
| `confirmed` | Exact structured input or exact producer-specific syntax supports the exported fields |
| `strong` | A reliable producer pattern supports the diagnostic, but some optional evidence is absent |
| `candidate` | Conservative generic pattern or heuristic only |
| `unknown` | Input cannot safely support a diagnostic conclusion |

Generic text regexes and naming heuristics MUST NOT produce `confirmed` confidence.

## 7. Normalization and evidence mapping

The parser MAY create a normalized view for newline and ANSI handling, but MUST maintain a monotonic mapping to raw artifact offsets. Normalization MUST NOT silently change evidence identity.

V0.1 MUST cover:

- LF and CRLF input;
- supported ANSI color/style sequences;
- bounded unsupported terminal sequences;
- multiline diagnostics;
- mixed stdout/stderr artifacts;
- Unix and Windows path syntax.

If a transformation prevents exact evidence recovery, affected fields MUST remain unknown and the result MUST describe the mapping problem.

## 8. Paths

Path normalization MUST be lexical and read-only; it MUST NOT resolve symlinks or probe the filesystem.

With an explicit root:

- contained paths SHOULD be emitted in forward-slash repository-relative form;
- absolute paths and `..` segments that escape root MUST NOT be emitted as trusted repository-relative locations;
- drive-letter and separator behavior MUST be deterministic across platforms;
- outside-root or ambiguous paths MUST be null or explicitly flagged.

Without a root, reported paths MAY be preserved in sanitized producer form but MUST NOT be labeled repository-relative.

## 9. Redaction

The parser MAY inspect raw in-memory input to recognize syntax. Exported messages, codes, paths, producer metadata, issues, warnings, summaries, and evidence excerpts MUST pass through redaction.

V0.1 MUST detect bounded key-name and value-pattern cases covering API keys, tokens, passwords, Authorization headers, database URLs, and signed URLs. Benign fields such as `inputTokens`, `outputTokens`, and `totalTokens` MUST remain readable unless their values independently match a secret pattern.

Raw secret-containing strings MUST NOT be used in diagnostic IDs, warnings, debug output, snapshots, or fixtures committed as real credentials.

## 10. Stable IDs, deduplication, and ordering

The diagnostic identity input is the canonical sanitized tuple:

```text
schema version
producer identity
severity
phase
code or null
normalized location or null
normalized sanitized message
```

The planned ID is `diag_` plus a lowercase SHA-256 prefix. The exact prefix length MUST be frozen with collision tests before implementation.

Diagnostics with the same complete identity tuple are deduplicated. Their distinct evidence references are unioned and sorted. Diagnostics MUST then sort by:

1. earliest artifact order;
2. earliest evidence start;
3. severity rank;
4. normalized file;
5. line;
6. column;
7. code;
8. stable ID.

Null ordering and severity rank MUST be fixed in implementation tests.

## 11. Resource budgets

| Budget | V0.1 ceiling |
| --- | ---: |
| Bytes per artifact | 2 MiB |
| Bytes per request | 20 MiB |
| Returned diagnostics | 200 |
| Evidence span | 64 KiB |
| Line length | 16 KiB |

V0.1 MUST also freeze ceilings for processed lines, parser matches, ANSI/terminal sequences, producer candidates, and aggregate evidence bytes before implementation. Exhaustion order and truncation reasons MUST be deterministic. A two-second cooperative timeout MAY be an emergency safety fuse but MUST NOT define normal completeness.

## 12. CLI contract

Planned commands:

```text
agent-error-lens parse --stdin --format json [--root <path>]
agent-error-lens capabilities --format json
```

CLI requirements:

- stdout contains only the machine-readable result for a valid operation;
- human-readable usage and fatal CLI diagnostics go to stderr;
- exit `0`: a valid result with `complete` or `partial` status was emitted;
- exit `1`: Error Lens emitted or encountered an `error` result;
- exit `2`: CLI usage or option validation failed before a result could be produced;
- producer failure MUST NOT be copied to the Error Lens process exit code;
- `--stdin` MUST NOT execute text that resembles a command;
- platform support remains unclaimed until the Node.js range and CI matrix are approved and verified.

## 13. Library and package contract

The public library MUST expose the same operations and result schema as the CLI. Public TypeScript types and runtime validation MUST share one authoritative schema contract.

Before release the package MUST define and verify:

- npm package name and availability;
- `exports`, types, and executable `bin` mappings;
- ESM/CommonJS policy;
- supported Node.js versions and operating systems;
- package file allowlist and source-map policy;
- license and third-party notices;
- SemVer compatibility rules for schema and API changes.

The target is zero runtime dependencies. Any exception requires an explicit reviewed decision and supply-chain analysis.

## 14. Verification matrix

| Area | Required evidence |
| --- | --- |
| Static | typecheck, lint, schema/type drift check |
| Unit | bounds, normalization, offsets, paths, redaction, IDs, dedup, sorting, status |
| Producer fixtures | TypeScript, Vitest, ESLint, generic structured, generic text |
| Structural fixtures | stream combinations, nested producers, multiline, ANSI, Windows/Unix paths |
| Failure fixtures | malformed, unsupported, truncated, long-line, excessive diagnostics, incomplete trace |
| Security | secret and benign-neighbor fixtures; no network/subprocess path |
| Determinism | repeated process runs with byte-identical output |
| Interface parity | CLI and library canonical result comparison |
| Build/package | build, tarball inspection, clean install, import and CLI smoke |
| Cross-platform | approved Node/OS matrix after compatibility decision |
| Agent-facing E2E | failure output to usable location/evidence without fabricated fields |
| Release | exact-HEAD CI, version, tag, release, registry integrity and `gitHead` readback |

Source tests alone do not prove package or release behavior.

## 15. Acceptance

V0.1 acceptance requires every measurable criterion in `GOAL.md`, every applicable verification row above, package artifact inspection, and explicit separation of Implemented, Verified, and Released state in `PROGRESS.md`.
