import { createHash } from "node:crypto";
import type {
  Diagnostic,
  Evidence,
  Phase,
  Severity,
  Summary,
} from "../../contract/agent-error-lens-v1.types.js";

const severityRank: Record<Severity, number> = { error: 0, warning: 1, info: 2, unknown: 3 };

export function createDiagnosticId(diagnostic: Omit<Diagnostic, "id">): `diag_${string}` {
  const location = diagnostic.location;
  const identity = [
    "1",
    diagnostic.producerId,
    diagnostic.severity,
    diagnostic.phase,
    diagnostic.code,
    location?.file ?? null,
    location?.line ?? null,
    location?.column ?? null,
    diagnostic.message,
  ];
  return `diag_${createHash("sha256").update(JSON.stringify(identity), "utf8").digest("hex")}`;
}

function compareNullable(left: string | number | null, right: string | number | null): number {
  if (left === right) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return left < right ? -1 : 1;
}

function evidenceKey(evidence: Evidence): string {
  return JSON.stringify([evidence.artifactId, evidence.kind, evidence.start, evidence.end, evidence.offsetUnit]);
}

function firstEvidence(diagnostic: Diagnostic, artifactOrder: Map<string, number>): Evidence {
  return [...diagnostic.evidence].sort((left, right) => {
    const artifactComparison = (artifactOrder.get(left.artifactId) ?? Number.MAX_SAFE_INTEGER) - (artifactOrder.get(right.artifactId) ?? Number.MAX_SAFE_INTEGER);
    return artifactComparison || left.start - right.start || left.end - right.end || left.kind.localeCompare(right.kind) || left.artifactId.localeCompare(right.artifactId);
  })[0] ?? diagnostic.evidence[0]!;
}

export function deduplicateDiagnostics(diagnostics: Diagnostic[], artifactOrder: Map<string, number>): Diagnostic[] {
  const byIdentity = new Map<string, Diagnostic>();
  for (const diagnostic of diagnostics) {
    const identity = JSON.stringify([
      diagnostic.producerId,
      diagnostic.severity,
      diagnostic.phase,
      diagnostic.code,
      diagnostic.location?.file ?? null,
      diagnostic.location?.line ?? null,
      diagnostic.location?.column ?? null,
      diagnostic.message,
    ]);
    const existing = byIdentity.get(identity);
    if (!existing) {
      byIdentity.set(identity, diagnostic);
      continue;
    }
    const evidence = new Map(existing.evidence.map((item) => [evidenceKey(item), item]));
    for (const item of diagnostic.evidence) evidence.set(evidenceKey(item), item);
    existing.evidence = [...evidence.values()].sort((left, right) => {
      const artifactComparison = (artifactOrder.get(left.artifactId) ?? Number.MAX_SAFE_INTEGER) - (artifactOrder.get(right.artifactId) ?? Number.MAX_SAFE_INTEGER);
      return artifactComparison || left.start - right.start || left.end - right.end || left.kind.localeCompare(right.kind) || left.artifactId.localeCompare(right.artifactId);
    }).slice(0, 32);
  }
  return [...byIdentity.values()].sort((left, right) => {
    const leftEvidence = firstEvidence(left, artifactOrder);
    const rightEvidence = firstEvidence(right, artifactOrder);
    const artifactComparison = (artifactOrder.get(leftEvidence.artifactId) ?? Number.MAX_SAFE_INTEGER) - (artifactOrder.get(rightEvidence.artifactId) ?? Number.MAX_SAFE_INTEGER);
    return artifactComparison
      || leftEvidence.start - rightEvidence.start
      || severityRank[left.severity] - severityRank[right.severity]
      || compareNullable(left.location?.file ?? null, right.location?.file ?? null)
      || compareNullable(left.location?.line ?? null, right.location?.line ?? null)
      || compareNullable(left.location?.column ?? null, right.location?.column ?? null)
      || compareNullable(left.code, right.code)
      || left.id.localeCompare(right.id);
  });
}

export function summarize(diagnostics: Diagnostic[], producerCount: number): Summary {
  return {
    diagnosticCount: diagnostics.length,
    errorCount: diagnostics.filter((item) => item.severity === "error").length,
    warningCount: diagnostics.filter((item) => item.severity === "warning").length,
    infoCount: diagnostics.filter((item) => item.severity === "info").length,
    unknownCount: diagnostics.filter((item) => item.severity === "unknown").length,
    producerCount,
  };
}

export function phaseForStructured(value: unknown): Phase {
  return value === "compile" || value === "test" || value === "lint" || value === "build" || value === "cli" ? value : "unknown";
}
