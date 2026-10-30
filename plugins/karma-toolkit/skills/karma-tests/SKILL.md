---
name: karma-tests
description: Аудит тестов, покрытие существующего поведения или разработка через TDD. При запуске уточняет режим работы.
---

# Karma Tests

Build tests that detect meaningful behavioral regressions, not a coverage percentage.

## Initialization: ask for the mode

On a direct invocation, first ask one short question: **Which mode: audit/coverage plan, tests for existing behavior, or implementation through TDD?** Briefly state what each mode may change. The user explicitly wants this startup question; wait for the answer before edits or test runs. Read-only discovery can continue while waiting. This is a choice of workflow, not permission for each subsequent edit.

If the user already selected a mode in the current conversation, continue it without asking again. When another skill delegates an explicitly scoped stage (for example preflight → audit), accept that mode without another questionnaire. Ask about materially new scope only.

## Modes and boundaries

- **Audit / coverage plan:** inspect test code, map critical scenarios, and run existing tests when the environment is suitable. Report gaps and evidence; do not change application code, tests, the catalog, or AGENTS.md. Test runs may create temporary outputs; disclose blocked runs.
- **Existing behavior:** add or improve tests and necessary test configuration/fixtures. Do not silently lock suspected bugs into expected behavior. Report them. A production-code testability refactor requires authorization unless the user already included it; explain the minimal change. Do not turn a coverage request into feature implementation.
- **TDD implementation:** implement the requested feature or fix. Write a behavioral regression/acceptance test, run it and confirm it fails for the expected reason, implement the minimum change, run it green, then refactor and recheck. Editing both production code and tests is authorized by this mode within the requested task. No repeated approval between red, green and refactor.

If a test was written after the fix, label it a regression test rather than claiming a witnessed red phase. A red-to-green cycle is evidence, not proof that assertions or requirements are correct.

## Workflow

1. Read applicable AGENTS.md instructions and identify the requested feature/scope, existing runner, fixtures, CI commands and data isolation. Prefer existing tooling.
2. Identify observable acceptance criteria: happy path, important failure paths, boundaries, permissions and state transitions. Separate desired behavior from current behavior. Agree on genuinely ambiguous requirements.
3. Pick the smallest useful mix of integration, unit and E2E tests. Use E2E for critical journeys, unit tests for pure logic, and integration tests for collaborating components. Avoid prescribed ratios.
4. Work feature by feature. Use deterministic fixtures and controlled clocks/randomness/external dependencies. Never run against live production data merely because credentials are available.
5. For broad or consequential changes, request an independent read-only reviewer of scenarios and assertions. Use a fresh context and available capabilities, inheriting session model/reasoning unless instructed otherwise. For a small regression, a focused check is sufficient. If independent review is unavailable, state that limitation.
6. Run relevant tests and the wider suite when the affected surface warrants it. Compare failures to the baseline; distinguish pre-existing failures from regressions. Repeat tests for suspected flakiness, not automatically several times for every change.
7. Use mutation testing when supported and proportionate. Inspect surviving mutations for real blind spots; document justified survivors and skipped checks. A reviewer score or mutation percentage is not a guarantee.
8. Update the catalog and project conventions after authorized implementation. Commit/push only when the user's task or applicable project instructions authorize them.

## Coverage catalog

Use the project's existing catalog if present; otherwise use `notes/test-catalog.md`. It is a navigation aid, not an authoritative claim that tests currently pass. Maintain it when tests change, including edits outside this skill.

Each entry records:
- feature/module and observable scenarios;
- test files or stable test identifiers;
- command(s) for running them;
- important uncovered cases and limitations;
- last actual verification: date, commit/worktree context, command and result;
- review or mutation evidence only if actually obtained.

Preserve unrelated entries. Mark moved/deleted tests or outdated verification; do not claim old results apply to changed code. Confirm coverage from current tests and runs. For an audit-only request, propose catalog updates without writing them.

## Project conventions in AGENTS.md

After authorized test/TDD work, maintain a concise managed sub-block in the applicable project AGENTS.md. Respect nested scope; never replace unrelated instructions. Use the established catalog path. In an audit-only run, report a suggested block without writing it.

```markdown
<!-- karma-toolkit:start -->
## Karma Toolkit — project conventions

<!-- karma-tests:start -->
Test scenarios and run commands: `notes/test-catalog.md`.
- Use test-first development for behavior-changing features and bug fixes where a meaningful automated test is practical. Document exceptions and alternative verification.
- Update relevant catalog entries when tests change; verify current code rather than trusting historical results.
- New features and milestones: assess testing gaps within the requested scope; do not automatically trigger a whole-project audit.
<!-- karma-tests:end -->
<!-- karma-toolkit:end -->
```

Create the umbrella once; replace only the `karma-tests` sub-block on subsequent runs. Preserve other skills' blocks. Replace a legacy `karma-tdd` block only in the same authorized scope. Do not write empty templates or maintain duplicate instruction files.

## Final report

State selected mode, scenarios checked/added versus gaps, actual commands/results, red-to-green evidence, verification limitations and catalog/convention changes. Already covered features may need no edits. Do not claim a green suite if tests could not run.
