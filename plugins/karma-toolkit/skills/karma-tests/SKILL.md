---
name: karma-tests
description: Cover an existing application's main scenarios with automated tests you can actually trust, one feature at a time. Use when the user wants to replace manual testing with e2e/integration/unit tests, build a test suite from scratch, or systematically raise meaningful coverage of business logic. Detects the stack and uses popular open-source tooling; pairs test-writing with an independent reviewer and (when available) mutation testing as an objective trust gate. Also use to introduce TDD for new work going forward.
---

# Karma Tests

Cover the app's main business scenarios with tests you can **trust**. Manual testing doesn't scale and gets forgotten; a trustworthy test checks the same thing every time, forever. Work **feature by feature**: a feature is done only when its tests exist, pass, are stable, and provably catch bugs.

A valid result for an already well-tested area is: `Already covered — no tests needed`.

## Plan-first contract

By default this skill produces a **discussable plan, not changes**. It ends its analysis with a prioritized list of what it proposes to do — *what / why / where* (which features, which scenarios, which test files) — then **stops for discussion and approval**. Writing tests happens only after an explicit go-ahead, as a separate execution phase. For hard enforcement, run the skill in plan mode (Shift+Tab), where edits are blocked until you approve.

## Core principle: trust over coverage

Coverage percentage lies — a green test that asserts nothing is worse than no test, because it creates false confidence. Every test must be able to fail for a real reason. Two guards enforce this:

- **Subjective:** an independent reviewer subagent that grades the tests, explicitly on "can these be trusted?".
- **Objective:** mutation testing where a mature tool exists for the stack (it breaks the code on purpose and checks that tests notice).

Never optimize the coverage number. Optimize for tests that would scream if the behavior broke.

## What this skill touches

By default this skill **only adds test files** — it does not modify the application's production code. Covering existing behavior (characterization) must not change that behavior.

The one exception is **testability**: occasionally existing code cannot be tested reliably without a small change (e.g. a hardcoded dependency on the clock, network, database, or a global that cannot be substituted in a test). When that happens, **stop and ask the user before touching production code** — explain the minimal change and why the test needs it. Never modify application code silently.

Bugs discovered while writing tests are **flagged to the user, never silently fixed**.

## Roles (strict separation)

- **Designer** — a subagent you *argue with* about WHICH scenarios to cover, before writing any test. Spawn it, then continue via follow-up messages for at most two short rounds of disagreement until you genuinely agree on a focused, high-value set.
- **Reviewer** — a *fresh, independent* subagent (no context fork from the writer) that grades the written tests. Prefer a code-review-capable agent if available (`feature-dev:code-reviewer`), else `general-purpose`. It must never be the agent that wrote the tests.
- **Writer** — you, the main agent. You write the tests and run everything.

All subagents run the single most capable model available at runtime, at the highest reasoning effort available — do not name or assume any model family or version; if you can't select one explicitly, inherit the session's model and never downgrade it. (Same convention as the `karma-loop` skill.)

## Two modes — do not confuse them

- **Characterization (existing code):** tests written AFTER the code, locking in current observable behavior. This is the bulk of "cover the app". **Caveat:** do not bake bugs in as expected behavior — if the scenario spar reveals that current behavior looks wrong, flag it for the user, don't enshrine it in a test.
- **TDD (new code / bug fixes going forward):** Red -> Green -> Refactor. Write a failing test first, see it red, write the minimum code to make it green, then refactor under the test's protection. Use this for any new feature or fix from now on. A TDD test is trustworthy by construction because you watched it fail.

## Test mix

Bias toward the **Testing Trophy**, not a strict pyramid:

- **Integration tests** — the largest share; best confidence-per-effort for business logic.
- **E2E tests** — for critical end-to-end user journeys (login, checkout, the core flow).
- **Unit tests** — a light sprinkle for tricky pure logic (calculations, parsers, edge-case branches).

Match the app; don't apply a ratio dogmatically.

## Stack detection

Detect language/framework from manifests (`package.json`, `pyproject.toml`/`requirements.txt`, `*.csproj`, `pubspec.yaml`, `go.mod`, etc.). Pick the most popular, well-maintained **open-source** tooling for that stack: a test runner, an e2e tool, a mocking approach, and a mutation tool **if a mature one exists**. Examples (not exhaustive):

| Stack | Runner / Integration | E2E | Mutation (if mature) | Mocking |
|-------|----------------------|-----|----------------------|---------|
| JS/TS | Vitest / Jest | Playwright | Stryker | MSW, Supertest |
| Python | pytest (+Hypothesis) | Playwright | mutmut / cosmic-ray | responses |
| .NET | xUnit + FluentAssertions, Testcontainers | Playwright .NET | Stryker.NET | NSubstitute |
| Flutter/Dart | flutter_test | integration_test, patrol | mutation_test | mocktail |
| Go | testing + testify | — | go-mutesting | — |

**Prefer tooling already present in the repo** over introducing new dependencies. Only add a tool when the stack clearly lacks one.

## Step 0 — Deep review and feature inventory

1. Read the app and map it into **features / scenarios**: entrypoints, user journeys, business rules, state transitions.
2. Write the feature list as a **checklist** — this is both the definition of done and the exit criterion for a long/autonomous run.
3. Identify the existing test setup, the run command, and whether a mutation tool is available for the stack.
4. Report the feature list to the user before starting to write tests.

## Per-feature pipeline

Take features one at a time. Finish a feature completely — written, stable, reviewed, gated, committed — before starting the next. (This keeps every commit shippable.)

For each feature:

1. **Spar on scenarios.** Spawn the Designer subagent and argue, adversarially, which scenarios matter: happy path, edge cases, error/empty/loading states, boundaries, permissions. For existing code, explicitly ask "is this behavior correct, or a bug we'd be enshrining?". Push back for up to two rounds until you agree on a focused, high-value set.
2. **Write the tests.** Implement the agreed scenarios with the stack's tooling. Use characterization for existing behavior. Make tests **isolated and deterministic**: fresh fixtures/seed per test, no dependence on test order, no reliance on wall-clock, network, or randomness unless controlled.
3. **Stabilize (flaky check).** Run the new tests several times (3-5x). If any flakes, fix the determinism before continuing — a flaky test is worse than no test because it trains everyone to ignore red.
4. **Independent review.** Spawn a fresh Reviewer subagent (no context fork). Give it the agreed scenario list. It scores the tests 1-10, explicitly including "**can these be trusted?**" — do they assert meaningfully, cover the agreed scenarios, avoid tautologies and over-mocking that make passing meaningless. Below threshold (default **< 8**) -> revise and re-review.
5. **Mutation gate (if available).** If a mature mutation tool exists for the stack, run it on this feature's code. Surviving mutants = blind spots: add or strengthen tests until the mutation score meets a sensible bar or each survivor is justified. If no tool exists, state explicitly that the objective gate was skipped.
6. **Full green run.** Run the WHOLE suite, not just the new tests, to catch regressions. It must be green.
7. **Commit & push.** One atomic commit for this feature's tests. Check the feature off the list.

## Exit criterion

Stop when every feature in the checklist is covered, reviewed, stable, and (where possible) mutation-gated. **Never imply full coverage if any feature was skipped** — report remaining uncovered features explicitly.

## Autonomous / long-running use

This skill is feature-by-feature by design, so it runs naturally as a long, goal-driven session: repeat the per-feature pipeline until the checklist is empty. Keep each feature atomic so progress is always shippable, and surface the running checklist so the user can see what's left.

## Guardrails

- Add only test files by default; never modify production code without asking first (see "What this skill touches").
- Trust beats coverage %. Never game the number.
- Don't bake bugs in as expected behavior — flag suspicious current behavior instead.
- No flaky tests get committed.
- The reviewer is independent and is never the writer; spawn it fresh.
- The full suite must be green before every push.
- Prefer existing repo tooling; add a new dependency only when the stack clearly lacks one.

## Final report

- **Features covered vs total** (the checklist).
- **Test mix added** — counts of e2e / integration / unit.
- **Tooling used** — runner, e2e, mocking, mutation tool (or "none available").
- **Trust signals** — reviewer scores, mutation scores (or skipped + why), flaky-checks run.
- **Suite status** — full green confirmed.
- **Remaining uncovered features / risks.**
- **Going forward** — recommend TDD for new features and bug fixes, with the detected tooling.
