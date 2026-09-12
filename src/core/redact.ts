const KEY_VALUE_PATTERN = /\b(api[-_]?key|apikey|access[-_]?token|token|password|passwd|secret|database[-_]?url|db[-_]?url|signed[-_]?url)\b(\s*[:=]\s*)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;]+)/giu;
const AUTHORIZATION_PATTERN = /\b(authorization)\b(\s*:\s*)(bearer\s+)[^\s,;]+/giu;
const SIGNED_QUERY_PATTERN = /([?&](?:x-amz-signature|x-amz-credential|signature|sig)=)[^&\s]+/giu;
const DATABASE_PASSWORD_PATTERN = /((?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?):\/\/[^:\/\s]+:)[^@\/\s]+(@)/giu;
const PROVIDER_TOKEN_PATTERN = /\b(?:sk-(?:live|test)-|ghp_|xox[baprs]-|AIza|AKIA)[A-Za-z0-9_-]{8,}\b/gu;

export function redactText(value: string): string {
  let sanitized = value.normalize("NFC");
  sanitized = sanitized.replace(AUTHORIZATION_PATTERN, "$1$2$3[REDACTED]");
  sanitized = sanitized.replace(KEY_VALUE_PATTERN, "$1$2[REDACTED]");
  sanitized = sanitized.replace(SIGNED_QUERY_PATTERN, "$1[REDACTED]");
  sanitized = sanitized.replace(DATABASE_PASSWORD_PATTERN, "$1[REDACTED]$2");
  return sanitized.replace(PROVIDER_TOKEN_PATTERN, "[REDACTED]");
}
