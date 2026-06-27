---
name: karma-loop
description: Итеративная петля качества кода. Свежий read-only субагент-ревьюер оценивает код по фиксированной шкале 0-10, ты чинишь найденное, и так по кругу до оценки 9.5 на двух проходах подряд. Работает БЕЗ лимита итераций — крутится, пока не достигнет порога, поэтому следи за расходом токенов и при необходимости останавливай вручную. Используй, когда нужно итеративно довести качество кода до максимума через автоцикл «ревью -> правки -> переревью».
---

# Karma Loop

Hill-climb code quality with an independent judge. Each round a **fresh, read-only** code-reviewer subagent grades the code and lists concrete issues. You fix the high-value ones, validate, and re-review. Stop when the bar is met or the loop provably can't improve.

A valid result is: `Already at the bar — no changes needed`.

## Autonomous by design (the one exception)

Unlike the other karma-* skills, this one is **autonomous**: it loops fix → re-grade without stopping for per-change approval — that is its purpose. It still records what it changed each round (the decision journal) and halts only when it reaches the pass threshold — or when you stop it manually, since there is no iteration cap (see Stop Condition). If you want plan-first control instead, run it in plan mode or use a different karma-* skill.

## Roles (strict separation)

- **Judge** — a read-only reviewer subagent running the single most capable model available at runtime, at the highest reasoning effort available. (Do not name or assume any model family or version — not today's, not future releases. Pick whatever model is objectively strongest at the moment the skill runs, whatever it is called. If you cannot select one explicitly, let the judge inherit the session's model and never downgrade it. The judge also inherits the session's reasoning effort, so run this skill at a high effort level.) Pick the agent type by portability: if `feature-dev:code-reviewer` (from the feature-dev plugin) appears in the available agent types, prefer it; otherwise fall back to the built-in `Explore` agent, which is read-only and always present. Whichever is used, the judge is read-only and MUST NOT edit code — it only scores and reports against the rubric below. State which judge was used in the final report.
- **Fixer** — you, the main agent. You make all edits, run all checks, and keep the decision journal. You never grade your own work; the judge's score is the only quality signal.

Keep these roles separate every round. Never let the judge write, and never substitute your own opinion for its score.

## Scope

Default: the whole project. If the user passes a path argument, scope the review (and fixes) to that file/folder. Note the chosen scope in the final report.

## The Rubric (fixed — give this to every judge verbatim)

The judge must score each dimension and produce one overall 0-10 score. Using the same rubric every round is what keeps a *fresh* judge from drifting between rounds.

1. **Correctness & logic** — bugs, wrong edge-case handling, race conditions, off-by-one, error handling.
2. **Security** — injection, authz/authn gaps, secret handling, unsafe deserialization, input validation.
3. **Readability & naming** — clear names, control flow, no dead/confusing code.
4. **Architecture & consistency** — fits existing conventions and layer boundaries; no business logic leaking into transport/infra.
5. **Tests** — meaningful coverage of the behavior in scope, not incidental detail.
6. **Simplicity** — no overengineering, no needless abstraction, no duplication.

The judge must return a structured verdict:

- `overall`: number 0-10 (one decimal).
- `dimensions`: each rubric item with a short score + one-line reason.
- `issues`: list of `{ severity (blocker|major|minor), file:line, problem, concrete fix }`, highest-impact first.
- `verdict_note`: one sentence on what most holds the score back.

If `overall` < 9.5 the judge MUST return at least one actionable issue (it cannot withhold a score without saying why).

## Stop Condition

- **PASS** — `overall` >= 9.5 on **two consecutive passes**. The first >=9.5 triggers a *confirming pass* with no edits in between; only a second >=9.5 ends the loop. (This beats single-judge noise at the threshold.)

This loop is **unbounded by design** (the user's explicit choice): there is no max-iteration cap and no plateau stop. It runs until PASS — which a strict judge may take many rounds to grant, or may never grant if it keeps finding new nits. **Consequences to accept:** it can burn tokens indefinitely and may oscillate (one round's fix undone by a later round). Watch the token budget and **stop it manually** if it stops converging. Always keep and report the **best-scoring** version, not necessarily the last one.

## Loop Procedure

**Setup (once):**

1. Run `git status --short --branch`. Note pre-existing/user-owned changes and do not clobber them. If not a git repo, warn that per-iteration rollback is manual.
2. Discover validation commands (test, typecheck, lint, build) from package scripts, Makefile, CI config, or docs. If none exist, say so — the gate degrades to "judge-only".
3. Initialize an empty decision journal.

**Each iteration:**

a. **Judge.** Spawn a fresh judge subagent (see Roles — `feature-dev:code-reviewer` if available, else `Explore`; most capable model available, highest reasoning effort). Give it: the scope, the fixed rubric above, the required verdict format, and the **decision journal so far** (every prior round's changes + rationale + the judge's prior top issues). Instruct it: *"Do not contradict an accepted decision from the journal unless you explicitly justify it as a regression worth reverting."* This is what prevents oscillation (round N undoing round N-1).

b. **Check stop.** Record `overall`, update the best version.
   - If `overall` >= 9.5 **and** the previous pass was also >= 9.5 -> **DONE (PASS)**.
   - If `overall` >= 9.5 and it's the first such pass -> run a **confirming pass**: go back to (a) with NO edits.
   - Otherwise continue to (c). There is no iteration cap — only PASS or a manual stop ends the loop.

c. **Fix.** Take the highest-value issues (blockers/majors first). Make the **minimal connected diff**. Preserve public API, contracts, response shapes, permissions, security behavior, and business behavior unless the user asked otherwise (reuse the discipline from the `karma-refactoring` skill). Do not chase the score with cosmetic churn.

d. **Journal.** Append: round #, `overall`, the fixes made, the rationale, and the judge's top issues this round.

e. **Gate.** Run the relevant tests/typecheck/lint for the touched surface.
   - Green -> iteration counts as progress.
   - Red -> revert this iteration's edits (or fix-forward only if trivial and re-gate). A red gate never counts as an improvement, regardless of what the next judge might say.

## Guardrails

- **Don't game the rubric.** Cosmetic changes that please the judge without improving the code are failures, not progress.
- **Don't change behavior to chase a score.** Functional/contract changes need explicit user intent.
- **Don't let the judge edit.** It is read-only; keep it that way.
- **Unbounded loop — mind the budget.** There is no iteration cap; the loop ends only on PASS or when you stop it. Watch token spend and halt manually if it stops converging or starts oscillating.
- **Return the best version, not the last.** A later round can score lower.
- **Be honest about the gate.** If tests couldn't run, say so; don't imply validation that didn't happen.

## Decision Journal Format

Per round, plain and compact:

```
Round N | overall: X.X
  changes: <what was edited>
  rationale: <why these, behavior preserved>
  judge top issues: <the issues this score was based on>
```

## Final Report

- **Outcome:** PASS (>=9.5 x2) / stopped manually at X.X / no changes needed.
- **Score trajectory:** round-by-round overall scores.
- **What changed** across rounds and why it matters.
- **Behavior/contracts preserved** (confirm).
- **Gate status:** which tests/typecheck/lint ran and their result, or why they couldn't.
- **Remaining issues** the judge still flags, if the loop stopped without a PASS.
- **Best version** is the current working tree (confirm).
- **Suggested commit message** when changes are ready.
