import type {
  Diagnostic,
  Evidence,
  InputArtifact,
  Producer,
  ToolIssue,
  Warning,
} from "../../contract/agent-error-lens-v1.types.js";
import { createDiagnosticId, phaseForStructured } from "./diagnostics.js";
import { LIMITS, type BudgetState } from "./limits.js";
import { normalizePath } from "./paths.js";
import { redactText } from "./redact.js";
import { rawBoundary, type NormalizedArtifact } from "./normalize.js";

export interface StructuredParseOutcome {
  supported: boolean;
  diagnostics: Diagnostic[];
  producers: Producer[];
  issues: ToolIssue[];
  warnings: Warning[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function boundedString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}

function makeIssue(code: string, message: string, artifactId: string, evidence: Evidence[] = []): ToolIssue {
  return { code, stage: "parse", message, artifactId, evidence };
}

function makeWarning(code: string, message: string, artifactId: string, evidence: Evidence[] = []): Warning {
  return { code, stage: "path", message, diagnosticId: null, artifactId, evidence };
}

function evidenceFor(view: NormalizedArtifact, start: number, end: number, budget: BudgetState, kind: Evidence["kind"]): Evidence | null {
  const rawStart = rawBoundary(view, start);
  const rawEnd = rawBoundary(view, end);
  if (rawEnd <= rawStart) return null;
  const rawContent = view.artifact.content.slice(rawStart, rawEnd);
  const bytes = Buffer.byteLength(rawContent, "utf8");
  if (bytes > LIMITS.maxEvidenceSpanBytes) {
    budget.reasons.add("evidence-bytes");
    return null;
  }
  const key = `${view.artifact.id}:${kind}:${rawStart}:${rawEnd}`;
  if (!budget.evidenceKeys.has(key)) {
    if (budget.evidenceBytes + bytes > LIMITS.maxAggregateEvidenceBytes) {
      budget.reasons.add("evidence-bytes");
      return null;
    }
    budget.evidenceKeys.add(key);
    budget.evidenceBytes += bytes;
  }
  return {
    artifactId: view.artifact.id,
    kind,
    start: rawStart,
    end: rawEnd,
    offsetUnit: "utf16-code-unit",
  };
}

function parseRecord(
  value: unknown,
  evidence: Evidence,
  artifact: InputArtifact,
  root: string | undefined,
  warnings: Warning[],
): Diagnostic | null {
  if (!isRecord(value)) return null;
  if (!boundedString(value.message, 8192) || value.message.length === 0) return null;

  const severity = value.severity === "error" || value.severity === "warning" || value.severity === "info" || value.severity === "unknown" ? value.severity : "unknown";
  const phase = phaseForStructured(value.phase);
  const code = value.code === undefined || value.code === null ? null : boundedString(value.code, 128) ? redactText(value.code) : null;
  if (value.code !== undefined && value.code !== null && code === null) return null;
  const lineValue = value.line;
  const columnValue = value.column;
  const line = lineValue === undefined || lineValue === null ? null : typeof lineValue === "number" && Number.isInteger(lineValue) && lineValue >= 1 ? lineValue : null;
  const column = columnValue === undefined || columnValue === null ? null : typeof columnValue === "number" && Number.isInteger(columnValue) && columnValue >= 1 ? columnValue : null;
  if ((value.line !== undefined && value.line !== null && line === null) || (value.column !== undefined && value.column !== null && column === null)) return null;

  let location = null;
  if (value.file !== undefined && value.file !== null) {
    if (!boundedString(value.file, 4096) || value.file.length === 0) return null;
    const normalizedPath = normalizePath(value.file, root);
    if (normalizedPath.outsideRoot || normalizedPath.file === null) {
      warnings.push(makeWarning("PATH_OUTSIDE_ROOT", "diagnostic path is outside the explicit root and was withheld", artifact.id, [evidence]));
    } else {
      location = { file: redactText(normalizedPath.file), line, column };
    }
  }

  const withoutId: Omit<Diagnostic, "id"> = {
    severity,
    phase,
    message: redactText(value.message),
    code,
    location,
    producerId: "generic-structured",
    confidence: "confirmed",
    evidence: [evidence],
  };
  return { id: createDiagnosticId(withoutId), ...withoutId };
}

export function parseStructuredArtifact(
  view: NormalizedArtifact,
  root: string | undefined,
  budget: BudgetState,
): StructuredParseOutcome {
  const empty: StructuredParseOutcome = { supported: false, diagnostics: [], producers: [], issues: [], warnings: [] };
  const firstNonWhitespace = view.text.search(/\S/u);
  if (firstNonWhitespace < 0) return empty;
  const first = view.text[firstNonWhitespace];
  if (first !== "{" && first !== "[") return empty;
  const lastNonWhitespace = view.text.search(/\s*$/u);
  const evidence = evidenceFor(view, firstNonWhitespace, lastNonWhitespace < 0 ? view.text.length : lastNonWhitespace, budget, "structured-field");
  if (!evidence) {
    return {
      supported: true,
      diagnostics: [],
      producers: [],
      issues: [makeIssue("EVIDENCE_SPAN_LIMIT", "structured input exceeds the evidence span budget", view.artifact.id)],
      warnings: [],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(view.text.slice(firstNonWhitespace, lastNonWhitespace < 0 ? view.text.length : lastNonWhitespace)) as unknown;
  } catch {
    budget.reasons.add("unsupported-format");
    return {
      supported: true,
      diagnostics: [],
      producers: [],
      issues: [makeIssue("STRUCTURED_INPUT_INVALID", "structured diagnostic JSON could not be parsed", view.artifact.id, [evidence])],
      warnings: [],
    };
  }

  const records = Array.isArray(parsed) ? parsed : isRecord(parsed) && Array.isArray(parsed.diagnostics) ? parsed.diagnostics : null;
  if (!records) {
    budget.reasons.add("unsupported-format");
    return {
      supported: false,
      diagnostics: [],
      producers: [],
      issues: [makeIssue("UNSUPPORTED_FORMAT", "structured JSON does not contain a diagnostics array", view.artifact.id, [evidence])],
      warnings: [],
    };
  }

  if (budget.producerCandidates >= LIMITS.maxProducerCandidates) {
    budget.reasons.add("producer-candidates");
    return { supported: true, diagnostics: [], producers: [], issues: [], warnings: [] };
  }
  budget.producerCandidates += 1;
  const producers: Producer[] = [{
    id: "generic-structured",
    name: "generic-structured",
    version: null,
    evidence: [evidence],
  }];
  const diagnostics: Diagnostic[] = [];
  const issues: ToolIssue[] = [];
  const warnings: Warning[] = [];
  for (const record of records) {
    if (budget.parserMatches >= LIMITS.maxParserMatches) {
      budget.reasons.add("parser-matches");
      break;
    }
    if (budget.diagnosticsBeforeLimit >= 10_000) {
      budget.reasons.add("parser-matches");
      break;
    }
    budget.parserMatches += 1;
    const diagnostic = parseRecord(record, evidence, view.artifact, root, warnings);
    if (!diagnostic) {
      budget.reasons.add("unsupported-format");
      issues.push(makeIssue("STRUCTURED_DIAGNOSTIC_INVALID", "structured diagnostic record is missing valid supported fields", view.artifact.id, [evidence]));
      continue;
    }
    budget.diagnosticsBeforeLimit += 1;
    if (diagnostics.length >= LIMITS.maxDiagnostics) {
      budget.reasons.add("diagnostics");
      break;
    }
    diagnostics.push(diagnostic);
  }
  if (records.length > diagnostics.length && diagnostics.length >= LIMITS.maxDiagnostics) budget.reasons.add("diagnostics");
  return { supported: true, diagnostics, producers, issues: issues.slice(0, LIMITS.maxToolIssues), warnings: warnings.slice(0, LIMITS.maxWarnings) };
}
