import type {
  ParseResult,
  ProducerOutcome,
  ToolIssue,
  Warning,
} from "../../contract/agent-error-lens-v1.types.js";
import { LIMITS } from "./limits.js";
import { redactText } from "./redact.js";

export function emptyData() {
  return {
    producers: [],
    diagnostics: [],
    summary: {
      diagnosticCount: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      unknownCount: 0,
      producerCount: 0,
    },
  };
}

export function emptyStats(artifactsReceived = 0, bytesReceived = 0) {
  return {
    artifactsReceived,
    artifactsProcessed: 0,
    bytesReceived,
    bytesProcessed: 0,
    linesProcessed: 0,
    parserMatches: 0,
    terminalSequences: 0,
    producerCandidates: 0,
    evidenceBytes: 0,
    diagnosticsBeforeLimit: 0,
  };
}

export function sanitizeProducerOutcome(outcome: ProducerOutcome | undefined): ProducerOutcome | undefined {
  if (!outcome) return undefined;
  const sanitized: ProducerOutcome = {};
  if (outcome.command !== undefined) sanitized.command = redactText(outcome.command);
  if (outcome.exitCode !== undefined) sanitized.exitCode = outcome.exitCode;
  if (outcome.signal !== undefined) sanitized.signal = outcome.signal === null ? null : redactText(outcome.signal);
  return sanitized;
}

export function addIssue(issues: ToolIssue[], issue: ToolIssue): void {
  if (issues.length < LIMITS.maxToolIssues) issues.push(issue);
}

export function addWarning(warnings: Warning[], warning: Warning): void {
  if (warnings.length < LIMITS.maxWarnings) warnings.push(warning);
}

export function errorResult(issue: ToolIssue, artifactsReceived = 0, bytesReceived = 0): ParseResult {
  return {
    schemaVersion: "1",
    status: "error",
    data: emptyData(),
    toolIssues: [issue],
    warnings: [],
    truncation: { truncated: false, reasons: [] },
    stats: emptyStats(Math.min(artifactsReceived, 64), Math.min(bytesReceived, 20 * 1024 * 1024)),
  };
}
