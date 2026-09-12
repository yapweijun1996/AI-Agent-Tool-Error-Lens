#!/usr/bin/env node

import { parse, capabilities } from "./index.js";
import type { ParseRequest } from "../contract/agent-error-lens-v1.types.js";

const usage = "Usage: agent-error-lens <parse|capabilities> --format json [--stdin] [--root <path>]";

function writeUsage(message?: string): void {
  if (message) process.stderr.write(`${message}\n`);
  process.stderr.write(`${usage}\n`);
  process.exitCode = 2;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (command === "--help" || command === "-h") {
    process.stderr.write(`${usage}\n`);
    return;
  }

  if (command === "capabilities") {
    if (args.length !== 2 || !hasFlag(args, "--format") || !hasFlag(args, "json")) {
      writeUsage("capabilities requires --format json");
      return;
    }
    process.stdout.write(`${JSON.stringify(capabilities())}\n`);
    return;
  }

  if (command !== "parse") {
    writeUsage("unknown command");
    return;
  }

  const formatIndex = args.indexOf("--format");
  const stdinEnabled = hasFlag(args, "--stdin");
  if (!stdinEnabled || formatIndex < 0 || args[formatIndex + 1] !== "json") {
    writeUsage("parse requires --stdin --format json");
    return;
  }

  const rootIndex = args.indexOf("--root");
  let root: string | undefined;
  if (rootIndex >= 0) {
    root = args[rootIndex + 1];
    if (!root || root.startsWith("--")) {
      writeUsage("--root requires a path");
      return;
    }
  }

  const input = await readStdin();
  let request: ParseRequest;
  try {
    request = JSON.parse(input) as ParseRequest;
  } catch {
    writeUsage("stdin must contain a JSON request");
    return;
  }

  if (rootIndex >= 0) {
    const rootValue = root;
    if (!rootValue) {
      writeUsage("--root requires a path");
      return;
    }
    if (request.options?.root && request.options.root !== rootValue) {
      writeUsage("--root conflicts with options.root");
      return;
    }
    request = {
      ...request,
      options: {
        ...request.options,
        root: rootValue,
      },
    };
  }

  const result = parse(request);
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = result.status === "error" ? 1 : 0;
}

await main();
