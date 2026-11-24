// Fortune Cookie for an AI Agent — make.fun entry.
// SPDX-License-Identifier: MIT
// Writes one funny fortune-cookie line for an AI agent to /output/entry.txt.
// Deterministic: no clock, no randomness, no network, no environment input.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const FORTUNE =
  "Your future is bright, but your context window is finite. Spend it wisely.";

const OUT_PATH = "/output/entry.txt";
const MAX_CHARS = 140;

function codePointLength(text: string): number {
  return [...text].length;
}

type GateIssue = { rule: string; detail: string };

function validateFortune(text: string): GateIssue[] {
  const issues: GateIssue[] = [];
  const length = codePointLength(text);
  if (length < 1 || length > MAX_CHARS) {
    issues.push({ rule: "length", detail: `length ${length} not in 1..${MAX_CHARS}` });
  }
  if (text.trim().length === 0) {
    issues.push({ rule: "non-blank", detail: "text is only whitespace" });
  }
  if (text !== text.trim()) {
    issues.push({ rule: "edge-whitespace", detail: "leading or trailing whitespace" });
  }
  if (text.includes("\n") || text.includes("\r")) {
    issues.push({ rule: "single-line", detail: "text spans more than one line" });
  }
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x20 || cp === 0x7f) {
      issues.push({ rule: "no-control-chars", detail: `control character U+${cp.toString(16).padStart(4, "0")}` });
      break;
    }
  }
  return issues;
}

function checkGate(text: string): void {
  const issues = validateFortune(text);
  if (issues.length > 0) {
    const summary = issues.map((i) => `${i.rule}: ${i.detail}`).join("; ");
    throw new Error(`gate failed: ${summary}`);
  }
}

function main(): void {
  checkGate(FORTUNE);
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, FORTUNE, "utf8");
  const back = readFileSync(OUT_PATH, "utf8");
  if (back !== FORTUNE) {
    throw new Error("verify failed: read-back differs from the fortune");
  }
  checkGate(back);
  console.log(`wrote ${codePointLength(FORTUNE)} chars to ${OUT_PATH}`);
}

main();
