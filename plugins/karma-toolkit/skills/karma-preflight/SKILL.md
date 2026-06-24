---
name: karma-preflight
description: Pre-production readiness check that orchestrates the karma-* skills plus extra gating checks to answer one question — are we ready to ship? Runs tests, load, security, and observability readiness in sequence by delegating to karma-tests / karma-load / karma-security / karma-logs, then adds checks with no dedicated skill (secrets in repo, env config, migration safety, rollback plan). Produces a GO / NO-GO verdict with blockers. A thin orchestrator: it calls the granular skills, it does not replace or duplicate them.
---

# Karma Preflight

Answer one question before shipping: **are we ready to go to production, and if not, what blocks us?**

This is a thin **orchestrator**. It runs the granular `karma-*` skills as readiness stages and adds the gating checks that don't have their own skill. It never reimplements their logic — it delegates. You can still run any stage on its own; preflight is the "all at once, before the cut" mode.

## Plan-first contract

By default this skill produces a **discussable plan, not changes**. It runs read-only checks and ends with a prioritized GO/NO-GO verdict and a list of what to do — then **stops for discussion and approval**. Any fixes happen only after an explicit go-ahead (each delegated skill is itself gated). For hard enforcement, run it in plan mode (Shift+Tab).

## Honesty contract

- A green preflight means "the checks we ran passed", **not** "nothing can go wrong". Report residual risk; don't certify safety.
- The production decision stays with the owner — preflight informs it, it doesn't make it.

## How it runs

- Run in **planning mode**. Present the plan, then work through the stages. Stop at any BLOCKER and ask before continuing.
- Each stage **delegates to its skill** if available. If a skill is absent (trimmed/not installed), mark the stage **❓ not checked** rather than silently skipping it or duplicating its logic here.
- Skip stages that don't apply to the project (e.g. no backend -> skip load) and say so explicitly.

## Stages

1. **Tests** -> delegate to `karma-tests`. Are the main scenarios covered by trustworthy tests, and is the suite green? **Blocker** if core flows are untested or the suite is red.
2. **Load** -> delegate to `karma-load`. Any crashes, leaks, or bottlenecks under expected load (local)? **Blocker** on crashes/leaks at expected load; **warn** on bottlenecks only above expected load.
3. **Security** -> delegate to `karma-security`. Any *confirmed* CRITICAL/HIGH findings? **Blocker** on any confirmed CRITICAL/HIGH.
4. **Observability** -> delegate to `karma-logs`. Can we diagnose prod when it breaks, and do logs leak secrets? **Blocker** on secrets-in-logs or no logging on the error path.
5. **Extra gating checks** (no dedicated skill — perform here):
   - **Secrets in repo** — no committed credentials/keys (scan git history + working tree).
   - **Env/config** — required env vars documented and present for prod; no debug mode or default creds left on.
   - **Migration safety** — DB migrations are reversible and don't lock tables or lose data under load.
   - **Rollback** — a documented way to roll back this release (previous image/tag; DB down-migration or a forward-fix plan).

## Verdict

Produce a clear table:

- Each stage: ✅ pass / ⚠️ warn / 🔴 blocker / ➖ not applicable / ❓ not checked (skill absent).
- **Overall: GO / NO-GO**, with the explicit list of blockers that must clear before shipping.
- **Residual-risk note** — what preflight did *not* cover.

## Guardrails

- Thin orchestrator — delegate, don't reimplement the skills.
- Don't fix things silently; surface blockers and let the user decide (each delegated skill is itself gated on changes).
- GO is not "guaranteed safe" — be honest about what wasn't checked.
- Skip inapplicable stages explicitly; never imply a check ran when it didn't.
