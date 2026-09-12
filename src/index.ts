import type {
  CapabilitiesResult,
  ParseRequest,
  ParseResult,
} from "../contract/agent-error-lens-v1.types.js";

export function capabilities(): CapabilitiesResult {
  return {
    schemaVersion: "1",
    operations: ["parse", "capabilities"],
    producers: [],
  };
}

export function parse(_request: ParseRequest): ParseResult {
  return {
    schemaVersion: "1",
    status: "error",
    data: {
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
    },
    toolIssues: [
      {
        code: "PARSER_NOT_IMPLEMENTED",
        stage: "parse",
        message: "Parser implementation is pending; no diagnostic interpretation was performed.",
        artifactId: null,
        evidence: [],
      },
    ],
    warnings: [],
    truncation: {
      truncated: false,
      reasons: [],
    },
    stats: {
      artifactsReceived: 0,
      artifactsProcessed: 0,
      bytesReceived: 0,
      bytesProcessed: 0,
      linesProcessed: 0,
      parserMatches: 0,
      terminalSequences: 0,
      producerCandidates: 0,
      evidenceBytes: 0,
      diagnosticsBeforeLimit: 0,
    },
  };
}
