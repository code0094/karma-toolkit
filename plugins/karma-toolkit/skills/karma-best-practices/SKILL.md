---
name: karma-best-practices
description: Отправляет субагентов искать, как другие уже решили конкретную задачу — готовые опенсорс-либы, референс-реализации, каноничные паттерны (веб + GitHub). Вызывай с аргументом-проблемой, когда упёрся в задачу, которую не решить из головы, или начинаешь новую фичу/проект — возможно, код писать не надо, он уже лежит опенсорс. Веттит кандидатов (живость, лицензия, CVE, соответствие масштабу проекта), независимо верифицирует рекомендацию, выдаёт варианты с trade-off — взять либу / адаптировать референс / написать самим — и по апруву интегрирует выбранное. Честно — популярное не значит правильное и не значит подходящее.
---

# Karma Best Practices

Don't reinvent the wheel — and don't import a dump truck to carry a bag of groceries. Given a **specific problem** (the argument), send agents **outward** (web + GitHub) to find how others already solved it: an existing open-source library, a reference implementation, a canonical pattern. Maybe no code needs to be written at all. Then vet what was found, recommend with an honest trade-off, and — on approval — integrate it.

This skill looks **outward**; the rest of the karma family audits your own code. It is on-demand (a problem exists), not a pre-production gate — it is intentionally NOT part of karma-preflight.

## Plan-first contract

By default this skill produces a **discussable plan, not changes**. It ends its research with ranked options and a recommendation — *what / why / trade-offs* — then **stops for discussion and approval**. Integration happens only after an explicit go-ahead, as a separate execution phase. For hard enforcement, run the skill in plan mode (Shift+Tab), where edits are blocked until you approve.

## Honesty contract (read first)

- **Popular ≠ correct ≠ fitting.** Search surfaces what is popular, not what is right for THIS project at THIS scale. A framework built for 5k rps is an anti-recommendation for a 2 rps app.
- **A dependency is a liability, not a free win** — maintenance, supply chain, bloat, someone else's release cycle. The honest output is a trade-off (library vs adapted reference vs ~N lines written here), never a dogma "always reuse".
- **"Best practice" is often an opinion**, contextual and contested between sources, and it rots. Prefer authoritative sources (official docs, maintainers, standards) over SEO blogspam; date every claim.
- **Go look — don't recall.** Which library is alive and recommended *now* changes constantly and often post-dates training. Check stars/last-commit/CVEs against reality, not memory.

## Input — the problem

The skill is invoked with an argument describing the problem, e.g. `/karma-best-practices how do people implement offline map tile caching in Flutter` or `…поищи, кто уже решал rate limiting за reverse proxy`. If the argument is missing or too vague to search, ask 1-2 sharpening questions (what exactly, what constraints) before spending tokens on research.

## Step 0 — Frame the problem against THIS project

Before searching, pin down the constraints that decide fit:

- **Stack and versions** (from manifests) — candidates must match it.
- **Project license** — what dependency licenses are compatible (GPL into a proprietary app is a stop).
- **Scale** — the real expected load/size, so candidates are judged for THIS scale, not for Google's.
- **Dependency budget** — how heavy a dependency this project can tolerate; existing deps that already partially solve the problem.
- **Prior decisions** — check the `karma-best-practices` block in CLAUDE.md (see Anchor below): if this problem was already decided here, surface that instead of re-litigating.

## Step 1 — Search prior art (multi-modal, delegated)

Spawn search subagents (running the most capable model available at the highest reasoning effort — do not name or assume any model family/version; if none is explicitly selectable, inherit the session's model and never downgrade). Run modalities **in parallel**, each blind to the others:

- **Package registry of the stack** (npm / PyPI / pub.dev / crates.io / NuGet…) — existing libraries for the problem.
- **GitHub** — `gh search repos` / `gh search code` when the CLI is available, else web search — reference implementations, how mature projects solve it.
- **Official docs / standards** — the canonical or built-in way (sometimes the framework already ships the solution).
- **Community discussions** (issues, Stack Overflow, HN/Reddit threads) — the *pitfalls* of each candidate; what people regret.

If a dedicated deep-research skill/agent is available in the session, the raw web fan-out may be delegated to it — the code-specific vetting below stays here either way.

## Step 2 — Vet every candidate

For each serious candidate, check against reality (not memory):

- **Liveness** — last commit/release, open-issue responsiveness, bus factor. Abandoned = anti-recommendation, whatever the stars say.
- **License** — compatible with the project (from Step 0)?
- **Health** — popularity as a signal (not a verdict), known CVEs / security advisories, dependency weight (what it drags in).
- **Fit** — does it solve THIS problem at THIS scale with THIS stack, or 80% of a different problem?

## Step 3 — Independent verification

Send the top recommendation to a **fresh, independent** verifier subagent (no context fork, same model convention) whose job is to **refute** it: is the project really alive, is the license really compatible, does it really fit the problem and scale, is there a well-known better alternative the search missed? Same role the verifier plays in karma-security — this filters hype and stale knowledge. Nothing is recommended until it survives refutation.

## GATE — Options and recommendation

Present a short ranked list (2-4 options), each with *what it is / evidence (liveness, license, health) / fit / cost*. Always include the **build-vs-reuse trade-off** honestly:

- **Take the library** — when it's alive, licensed, fitting, and the problem is genuinely hard or commodity.
- **Adapt a reference** — when implementations exist but as patterns, not packages; cite the source.
- **Write it yourself (~N lines)** — when the honest answer is that 15 lines beat a 5 MB dependency.

State a recommendation and **stop for approval**. If nothing found survives vetting, say so plainly — "no trustworthy prior art; write it" is a valid, honest result.

## Integration (gated)

On approval, integrate the chosen option as minimal diffs following the project's conventions: add the dependency (pinned), wire it in, respect the project's CLAUDE.md conventions (including the karma-tests TDD block if present — test-first where it applies), and run the full suite green. Flag anything the integration surfaced that changes the trade-off (e.g. the lib needs three more transitive deps than advertised) instead of pushing through.

## Anchor the decision in CLAUDE.md (automatic)

Record adopted decisions so a future session doesn't re-litigate or duplicate them. As a standard final step — **only when something was actually decided** (adopted a lib/pattern, or explicitly rejected candidates in favor of writing it) — write/refresh this skill's sub-block in the umbrella `karma-toolkit` block at the **end** of the project root `CLAUDE.md`. **Write it automatically — do not ask.** This is the one exception to the plan-first contract: integration code stays gated as above, but this small managed note is written without a prompt (in plan mode the write defers to the execution phase like any edit). Touch only your own `<!-- karma-best-practices:start/end -->` sub-block; idempotent on the markers — no umbrella block yet → append it at the end of the file (create `CLAUDE.md` if absent); your sub-block already present → replace its body, never duplicate; leave other skills' sub-blocks intact.

```
<!-- karma-toolkit:start -->
## karma-toolkit — project conventions (managed; edited by the karma-* skills)

<!-- karma-best-practices:start -->
Prior-art decisions here: <adopted libs/patterns with date and reason — e.g. 29.06.2026 rate limiting → fastapi-limiter (MIT, alive, fits our ~2 rps) over hand-rolled middleware; offline tiles → adapted flutter_map_tile_caching pattern, lib itself rejected (GPL)>.
- Same problem again → check this list first; don't re-litigate or duplicate a solved decision.
<!-- karma-best-practices:end -->
<!-- karma-toolkit:end -->
```

Append new decisions to the existing list (keeping earlier entries); if the run ended with no durable decision, write nothing.

## Guardrails

- Evidence over memory — every liveness/license/CVE claim checked against the live source, with dates.
- Authoritative sources over blogspam; note when sources disagree instead of picking silently.
- No recommendation without the refutation pass surviving.
- The trade-off (lib / adapt / write) is always presented — reuse is a choice, not a reflex.
- Integration is minimal, pinned, convention-following, and gated on approval.
- "Nothing trustworthy found" is a valid result — say it instead of stretching a weak candidate.

## Final report

- **The problem** as framed (with the constraints that decided fit).
- **Options considered** with evidence and why rejected/ranked.
- **Recommendation + trade-off**, verification verdict included.
- **What was integrated** (if approved) and suite status.
- **Honesty** — what wasn't checked (e.g. no local benchmark of the lib), and that fit was judged from available evidence, not from running it in production.
