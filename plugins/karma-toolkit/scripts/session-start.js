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
  "- New code: write the test first (TDD). To cover existing code with tests, use the karma-tests skill.",
  "- The karma-* skills are plan-first: they propose a discussable plan and wait for approval before changing code. karma-loop is the intentional autonomous exception.",
].join("\n");

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: policy,
    },
  })
);
