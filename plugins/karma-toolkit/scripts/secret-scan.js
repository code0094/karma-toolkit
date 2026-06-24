// karma-toolkit PreToolUse hook: scan for secrets before `git push`.
//
// Invoked in exec form as `node <this file>` (see hooks/hooks.json). Reads the hook
// JSON on stdin, and on a real `git push` scans what the push would send (staged +
// unpushed commits) for common secret patterns. On a hit it emits a PreToolUse
// "deny" decision (exit 0 + JSON); otherwise it prints nothing and exits 0, so the
// normal permission flow proceeds.
//
// This is a SAFETY NET, not a guarantee: the `if` matcher fails open on unparseable
// commands, and the patterns below catch common cases, not everything. The real
// audit is the karma-security skill. We re-check the command ourselves here so the
// hook also works on Claude Code versions without the `if` filter.

const { execSync } = require("node:child_process");

function git(args) {
  try {
    return execSync(`git ${args}`, {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let command = "";
  try {
    command = JSON.parse(raw)?.tool_input?.command ?? "";
  } catch {
    /* no/invalid input: be conservative and proceed */
  }

  // Only act on an actual git push; otherwise stay silent and let it proceed.
  if (!/\bgit\b[^&|;]*\bpush\b/.test(command)) {
    process.exit(0);
  }

  // Best-effort view of what a push would send: staged changes + unpushed commits.
  let diff = git("diff --staged");
  const unpushed = git("log -p @{u}..HEAD");
  diff += unpushed || git("log -p -n 30 HEAD"); // fallback when no upstream is set

  const RULES = [
    [/AKIA[0-9A-Z]{16}/, "AWS access key id"],
    [/-----BEGIN (?:RSA|OPENSSH|EC|DSA|PGP) PRIVATE KEY-----/, "private key"],
    [/gh[pousr]_[A-Za-z0-9]{36,}/, "GitHub token"],
    [/xox[baprs]-[A-Za-z0-9-]{10,}/, "Slack token"],
    [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, "JWT"],
    [/(?:api[_-]?key|secret|password|passwd|token)\s*[:=]\s*['"][^'"]{12,}['"]/i, "hardcoded credential"],
  ];

  const hits = [...new Set(RULES.filter(([re]) => re.test(diff)).map(([, name]) => name))];

  if (hits.length) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason:
            `Push blocked by karma-toolkit: possible secret(s) detected — ${hits.join(", ")}. ` +
            `Remove them from the diff/history (e.g. git rm --cached, rewrite history) before pushing, ` +
            `or run the karma-security skill. Note: this is a heuristic scan that catches common ` +
            `patterns, not everything — it is a safety net, not a guarantee.`,
        },
      })
    );
  }

  // No hit -> print nothing -> normal permission flow proceeds.
  process.exit(0);
});
