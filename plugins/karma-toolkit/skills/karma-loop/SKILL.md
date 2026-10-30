---
name: karma-loop
description: Итеративное улучшение кода с независимым ревью и проверками. Ограниченный цикл по умолчанию, непрерывный режим по явному запросу.
---

# Karma Loop

Improve scoped code through independent review, minimal fixes and executable validation. Preserve product behavior and public contracts unless the user requested their change.

## Scope and execution

Use the user's named scope; otherwise use the current task's changes. Ask before expanding an ambiguous task to the whole project. An improvement request authorizes in-scope fixes without approval each round. A review-only request produces findings without fixes.

Read git status first and preserve user-owned changes. Discover validation commands and applicable AGENTS.md instructions. Inspect the test catalog when present, but verify entries against current tests. If coverage is missing, report the limitation and use a meaningful targeted check; broad test-writing needs its own scope.

## Roles

- **Reviewer:** fresh independent subagent with a read-only task, no writer context fork; use available capabilities rather than assuming named Claude agent types. Inherit session model and reasoning unless instructed otherwise.
- **Implementer:** main agent; verifies findings, makes minimal fixes, runs checks and maintains a compact decision journal.

If independent review is unavailable, report the limitation and do not claim an independently verified result. Never fabricate a score.

## Review criteria

Check correctness, security, meaningful tests, maintainability, architectural fit and unnecessary complexity. Return actionable findings with severity, file/line, concrete evidence and expected correction. Separate preferences from defects. A score may summarize the review, but must not force the reviewer to invent an issue.

## Loop

1. Record scope, baseline checks and stop policy. Default: up to **4 fix rounds** followed by final review. Honor a user-specified budget or stricter limit.
2. Give a fresh reviewer the scope, criteria, relevant code/tests and prior accepted decisions. Require evidence for reversing a previous decision.
3. Check findings before acting. Fix confirmed high-value issues within scope; avoid cosmetic churn.
4. Run appropriate checks. Failed checks are not progress. Fix forward or revert only this round's own edits without discarding pre-existing work.
5. Record findings, corrections, validation and remaining issues. Store the journal in the task's existing notes location for multi-round work.
6. Re-review final code. Finish successfully when no confirmed actionable defects remain in scope and applicable checks pass. Unavailable checks mean incomplete validation, not PASS.

## Stop policies

- **Default:** stop on verified completion, round/budget limit, unavailable input, or two consecutive rounds without verified progress / with conflicting repeated fixes. Report unresolved findings; a budget stop is not success.
- **Continuous mode:** only on explicit request, continue without a default round cap. Preserve external budgets and authorization boundaries. Stop for user interruption, unavailable prerequisites or verified completion; surface oscillation and do not repeatedly apply mutually reversing edits.
- **Score target:** if explicitly requested (for example 9.5 twice), use a fixed rubric (correctness, security, tests, maintainability, architecture, simplicity; each 0–10 with reasons, plus overall) and two independent consecutive reviews of unchanged code at the target. Checks must still pass. Report an unmet target honestly when another stop condition applies.

Keep the last verified working state. Never restore a version solely because a subjective score was higher or overwrite unrelated changes. Commit/push only when already authorized.

## Final report

Report outcome (complete, limit reached, blocked or stopped), scope, rounds, confirmed improvements, actual checks and remaining risks. Include scores only if used and identify unavailable validation.
