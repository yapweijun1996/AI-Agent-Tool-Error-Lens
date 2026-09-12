import type {
  Diagnostic,
  Evidence,
  InputArtifact,
  Phase,
  Severity,
  Warning,
} from "../../contract/agent-error-lens-v1.types.js";
import { createDiagnosticId } from "./diagnostics.js";
import { normalizePath } from "./paths.js";
import { redactText } from "./redact.js";
import { isWellFormedUnicode } from "./validation.js";

export interface DiagnosticFields {
  severity: Severity;
  phase: Phase;
  message: string;
  code: string | null;
  file: string | null;
  line: number | null;
  column: number | null;
  producerId: string;
  confidence: Diagnostic["confidence"];
  evidence: Evidence[];
}

export function makeDiagnostic(
  fields: DiagnosticFields,
  artifact: InputArtifact,
  root: string | undefined,
  warnings: Warning[],
): Diagnostic | null {
  if (!isWellFormedUnicode(fields.message) || fields.message.length === 0 || fields.message.length > 8192) return null;
  if (fields.code !== null && (!isWellFormedUnicode(fields.code) || fields.code.length > 128)) return null;
  if (fields.file !== null && !isWellFormedUnicode(fields.file)) return null;
  if (fields.line !== null && (!Number.isSafeInteger(fields.line) || fields.line < 1)) return null;
  if (fields.column !== null && (!Number.isSafeInteger(fields.column) || fields.column < 1)) return null;
  if (fields.evidence.length === 0) return null;

  let location = null;
  if (fields.file !== null) {
    if (fields.file.length === 0 || fields.file.length > 4096) return null;
    const normalizedPath = normalizePath(fields.file, root);
    if (normalizedPath.outsideRoot || normalizedPath.file === null) {
      warnings.push({
        code: "PATH_OUTSIDE_ROOT",
        stage: "path",
        message: "diagnostic path is outside the explicit root and was withheld",
        diagnosticId: null,
        artifactId: artifact.id,
        evidence: fields.evidence.slice(0, 32),
      });
    } else {
      location = {
        file: redactText(normalizedPath.file),
        line: fields.line,
        column: fields.column,
      };
    }
  }

  const withoutId: Omit<Diagnostic, "id"> = {
    severity: fields.severity,
    phase: fields.phase,
    message: redactText(fields.message),
    code: fields.code === null ? null : redactText(fields.code),
    location,
    producerId: fields.producerId,
    confidence: fields.confidence,
    evidence: fields.evidence.slice(0, 32),
  };
  return { id: createDiagnosticId(withoutId), ...withoutId };
}
