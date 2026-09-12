import { chmod } from "node:fs/promises";

await chmod("dist/src/cli.js", 0o755);
console.log("CLI executable bit: set");
