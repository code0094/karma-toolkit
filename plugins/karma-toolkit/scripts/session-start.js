// karma-toolkit SessionStart hook: inject the standing policy into every session.
//
// Invoked in exec form as `node <this file>` (see hooks/hooks.json). Using Node — a
// real executable present everywhere — means this works the same under Git Bash or
// PowerShell on Windows, with no dependency on jq/sh, shebangs, or the exec bit.
// It must print the JSON below to stdout and exit 0; Claude Code only honors the
// JSON on a zero exit code.

const policy = [
  "# karma-toolkit — standing policy",
  "",
  "- Follow the requested scope: audits diagnose without code or project-instruction edits; implementation requests authorize in-scope changes and verification without repeated approvals.",
  "- On direct karma-tests initialization, ask for audit, existing-behavior coverage, or TDD mode and wait. Reuse a mode already selected in this task or explicitly delegated by preflight.",
  "- Maintain durable project conventions in AGENTS.md after authorized work; preserve unrelated instructions and managed blocks. Test catalogs are navigation aids, not proof of current passing tests.",
  "- karma-loop uses bounded rounds by default; continuous or score-target modes require an explicit request. Commit, push and deployment follow task authorization.",
].join("\n");

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: policy,
    },
  })
);
