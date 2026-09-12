import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const npmExecPath = process.env.npm_execpath;
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const command = npmExecPath ? process.execPath : npmCommand;
const commandArgs = npmExecPath
  ? [npmExecPath, "pack", "--dry-run", "--json", "--ignore-scripts"]
  : ["pack", "--dry-run", "--json", "--ignore-scripts"];
const pack = spawnSync(command, commandArgs, { encoding: "utf8" });
if (pack.status !== 0) {
  const failureDetail = [pack.stderr, pack.stdout, pack.error?.message]
    .filter(Boolean)
    .join("\n")
    .trim();
  console.error(failureDetail || "npm pack dry-run failed");
  process.exit(1);
}

let metadata;
try {
  metadata = JSON.parse(pack.stdout);
} catch {
  console.error("npm pack dry-run did not return JSON metadata");
  process.exit(1);
}

const files = metadata[0]?.files?.map((entry) => entry.path).sort() ?? [];
const allowed = (path) => path === "package.json"
  || path === "contract/agent-error-lens-v1.schema.json"
  || path.startsWith("dist/");
const required = [
  "package.json",
  "contract/agent-error-lens-v1.schema.json",
  "dist/src/index.js",
  "dist/src/index.d.ts",
  "dist/src/cli.js",
  "dist/src/core/serialize.js",
];

if (!packageJson.private || packageJson.type !== "module" || packageJson.engines?.node !== ">=20.11.0 <25") {
  console.error("package metadata does not match the frozen private ESM Node contract");
  process.exit(1);
}
if (Object.keys(packageJson.dependencies ?? {}).length !== 0) {
  console.error("runtime dependencies are not empty");
  process.exit(1);
}
if (files.some((path) => !allowed(path)) || required.some((path) => !files.includes(path))) {
  console.error(`package allowlist mismatch: ${files.join(", ")}`);
  process.exit(1);
}

console.log(`package allowlist audit: passed (${files.length} files)`);
