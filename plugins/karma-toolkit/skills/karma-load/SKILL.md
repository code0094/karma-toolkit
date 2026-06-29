---
name: karma-load
description: Локальное нагрузочное тестирование бэкенда — найти баги и узкие места под нагрузкой перед продакшеном. Используй, когда нужно нагрузить приложение локально популярным опенсорс-инструментом (по умолчанию k6), выявить медленные запросы / N+1 / утечки / дедлоки / пределы пула соединений по логам и метрикам, замерить относительные улучшения и составить осторожный план масштабирования. Определяет, как запускается приложение (Docker если есть, иначе нативно), наращивает нагрузку ступенями против pass/fail SLO, собирает находки в notes/ затем tasks/. Работает в режиме планирования с гейтами на апрув. ТОЛЬКО ЛОКАЛЬНО — находит проблемы дёшево, но НЕ даёт прод-валидных абсолютных цифр RPS.
---

# Karma Load (local)

Stress the backend on the local machine to find **what breaks and why** — bugs, bottlenecks, slow queries, leaks, deadlocks, connection-pool ceilings — and turn findings into tasks, before going to production.

## Plan-first contract

By default this skill produces a **discussable plan, not changes**. It ends its analysis with a prioritized list of what it proposes to do — *what / why / where* — then **stops for discussion and approval**. Changes happen only after an explicit go-ahead, as a separate execution phase. For hard enforcement, run the skill in plan mode (Shift+Tab), where edits are blocked until you approve.

## Scope and honesty (read first)

- **Local only.** The app and the load generator run on one machine.
- This finds problems and measures **relative** change (is it better/worse after a fix). It does **not** produce production-valid absolute RPS limits: the generator and the app share the same hardware, and local hardware is not the production instance. **Always state this caveat** in reports; never claim "holds X rps in prod" from a local run.
- Optimize for finding bottlenecks and bugs, not for a vanity rps number.

## Operating rules

- Run in **planning mode**; stop at the approval gates below before making fixes or starting a long run.
- Do not change app behavior or public contracts while fixing bottlenecks beyond what the user approves — keep fixes minimal and behavior-preserving.
- **Docker is nice-to-have, not required** — use whatever run method the project already has.

## How the app runs (detect, don't impose)

- Detect the run method: a `Dockerfile`/`docker-compose.yml` -> use it (brings dependencies up in one command, and is closer to prod). No Docker -> run natively per README/manifests and bring up dependencies the way the project already does.
- Bring up the **real dependencies** the app needs (Postgres, Redis, S3 -> MinIO locally, queues/workers, crons) so the test exercises real interactions, not stubs. The DB and workers are usually where load actually hurts.
- **Seed the DB with realistic data volume.** An empty database hides index and query cost and gives falsely good numbers.

## Tool

- Default **k6** (Grafana): efficient, JS scenarios, sustains high rps from one machine. If the project already uses another popular open-source tool that fits, prefer that.
- **Watch the generator itself** (its CPU/memory). If k6 saturates the machine, then k6 — not the app — is the limit; note it and reduce ambition or move the generator off the app's cores.

## Stage 1 — Deep review for bottlenecks (GATE)

Read the implementation before generating any load. Look for:

- DB access: N+1 queries, missing indexes, full scans, unbounded result sets, lock-heavy transactions.
- Connection pool configuration (size, exhaustion behavior) — a frequent true ceiling well before the backend itself.
- Synchronous/blocking I/O on hot paths, missing caching, per-request expensive work.
- Worker/cron interactions that contend with request handling.

If clear bottlenecks for the target load exist, produce a **plan as a list** — each item: **problem / why it matters / how to fix**. (For broad code discovery, delegate to a subagent if available, running the most capable model available; verify findings before acting.)

**GATE:** present the plan, wait for the user's green light. Do not edit code until approved.

## Stage 2 — Make approved fixes

Apply approved fixes as minimal connected diffs. Re-run a quick load check to confirm the **relative** improvement (before/after under the same scenario).

## Stage 3 — Load test plan (GATE)

Define the plan before running:

- **SLOs = the pass/fail criteria, not raw rps.** E.g. p95 < X ms, p99 < Y ms, error rate < Z%, and latency stable over time (no upward drift under sustained load).
- **Realistic scenario mix** (read/write, multiple endpoints weighted by expected traffic, think-time) — not one flat URL hammered.
- **Ramp stages:** user-supplied targets (e.g. 1k, 3k, 5k rps). Include a short **soak** (sustained load) to catch leaks and connection exhaustion that a 30-second peak hides.

**GATE:** present the plan, wait for the user's start command.

## Stage 4 — Run and observe

Run the ramp. Capture **both sides**:

- **Client (k6):** latency percentiles, error rate, throughput per stage.
- **Server:** app CPU/memory, Postgres active connections / locks / slow queries, worker queue depth, GC pauses if relevant.

Logs alone are not enough — correlate metrics with logs to explain **why**, not just "it got slow".

## Stage 5 — Findings -> notes -> tasks

- Save each issue to `notes/<note.md>`: symptom, evidence (metric/log/repro steps), suspected cause, affected area.
- Then split into `tasks/<task.md>`: one actionable fix per task, prioritized by impact.

## Stage 6 — Production scaling doc

Based on the bottlenecks found and the relative data, write a cautious rollout doc:

- Start with **minimal sufficient infra** — don't provision for 5k rps when real load is ~2 rps.
- Scale the **DB vertically** (bigger managed tier) as load grows; scale **backends horizontally** (more instances behind a balancer), each on a minimal sufficient machine.
- Note the **connection-pool ceiling** (pgbouncer or similar is usually needed before high rps).
- **Honesty:** mark absolute thresholds as estimates from local testing plus reasoning, not measured production limits. Real prod-capacity numbers require a cloud prod-like run, which is out of scope here.

## Stage 7 — Teardown

Return the machine to how it was: `docker compose down -v` if Docker was used, else stop the processes and clean the test data/DB. Don't leave dependencies or seed data lying around.

## Anchor perf hotspots in CLAUDE.md (automatic)

Capture the performance-sensitive spots and the bottlenecks you fixed, so future code doesn't reintroduce them. As a standard final step, write/refresh this skill's sub-block in the umbrella `karma-toolkit` block at the **end** of the project root `CLAUDE.md`. **Write it automatically — do not ask.** This is the one exception to the plan-first contract: the fix *plan* and any code changes stay gated as above, but this small managed note is written without a prompt (in plan mode the write defers to the execution phase like any edit). Touch only your own `<!-- karma-load:start/end -->` sub-block; idempotent on the markers — no umbrella block yet → append it at the end of the file (create `CLAUDE.md` if absent); your sub-block already present → replace its body, never duplicate; leave other skills' sub-blocks intact.

```
<!-- karma-toolkit:start -->
## karma-toolkit — project conventions (managed; edited by the karma-* skills)

<!-- karma-load:start -->
Perf hotspots here: <the real ones — e.g. build_doc was N+1, now batched (content.py); leaderboard has a composite index; connection pool sized to the threadpool>. Load notes: <path to the scaling / load-test doc if one was written>.
- New endpoint / query → check for N+1 and missing indexes; watch the connection-pool ceiling under concurrency.
<!-- karma-load:end -->
<!-- karma-toolkit:end -->
```

Fill with the project's **actual** hotspots and pool sizing (`file:line` where useful), not a generic note. If this run found and fixed nothing worth remembering, write nothing.

## Guardrails

- Local results are relative and for bug-finding — never present them as prod-valid absolutes.
- SLOs, not vanity rps.
- Real dependencies + realistic data, not stubs or an empty DB.
- Watch the generator so it isn't the hidden bottleneck.
- Don't change behavior/contracts to chase numbers without approval.
- Clean teardown; leave the machine as found.

## Final report

- **Mode:** local (state the caveat).
- **Bottlenecks found** + fixes applied.
- **SLO results per ramp stage** (relative).
- **Generator headroom** — was it ever the limit?
- **`notes/` and `tasks/`** written.
- **Scaling doc** location.
- **Caveat:** absolute production capacity was not measured (local-only run).
