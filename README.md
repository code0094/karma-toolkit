# karma-toolkit

A plan-first **"bring code to production"** skill family for Claude Code. Eight skills, each wrapping one production-readiness workflow with an independent critic/verifier and honest framing of its limits — plus a `SessionStart` hook that injects a standing TDD / plan-first policy into every session.

## The skills

| Command | What it does |
|---------|--------------|
| `/karma-toolkit:karma-refactoring` | Behavior-preserving maintenance refactor (scope proposal + challenge checkpoint). |
| `/karma-toolkit:karma-refactoring-ui` | Move visual styling into components; layout stays outside. |
| `/karma-toolkit:karma-loop` | Autonomous fix → re-grade loop to a quality bar (the one non–plan-first skill). |
| `/karma-toolkit:karma-tests` | Trustworthy test coverage, feature by feature, with an independent reviewer. |
| `/karma-toolkit:karma-load` | **Local** load-testing to find bottlenecks and bugs (no cloud). |
| `/karma-toolkit:karma-security` | Iterative, self-contained security audit with adversarial verification. |
| `/karma-toolkit:karma-logs` | Observability / logging readiness before production. |
| `/karma-toolkit:karma-preflight` | Thin orchestrator: runs the others + secrets/env/migration/rollback checks → GO / NO-GO. |

## Two principles across the family

- **Plan-first.** Every skill (except `karma-loop`) produces a *discussable plan* — what / why / where — and waits for approval before changing code. Run in plan mode (Shift+Tab) for hard enforcement.
- **Honest about limits.** No skill claims certainty it can't have ("zero vulnerabilities", "guaranteed to hold X rps"). They reduce risk and report residual risk.

## Install (via marketplace)

```bash
/plugin marketplace add <git-url-of-this-repo>
/plugin install karma-toolkit@karma
```

Commands are namespaced under the plugin: `/karma-toolkit:karma-<name>`. To update later: `/plugin marketplace update karma`.

## Local development & testing

```bash
# Load the plugin directly for a session, without installing:
claude --plugin-dir ./plugins/karma-toolkit

# Validate manifest + skill frontmatter + hooks.json:
claude plugin validate ./plugins/karma-toolkit

# See plugin loading + hook registration:
claude --debug
```

The `SessionStart` hook runs `node scripts/session-start.js` (exec form, so it works under Git Bash or PowerShell on Windows) and injects the standing policy as session context.

## Layout

```
.
├── .claude-plugin/marketplace.json   # this repo is also a marketplace
└── plugins/
    └── karma-toolkit/
        ├── .claude-plugin/plugin.json
        ├── hooks/hooks.json          # SessionStart -> scripts/session-start.js
        ├── scripts/session-start.js  # prints the policy as additionalContext
        └── skills/karma-*/SKILL.md   # the eight skills
```
