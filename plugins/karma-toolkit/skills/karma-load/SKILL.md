---
name: karma-load
description: "Локальное нагрузочное тестирование бэкенда: воспроизвести узкие места, измерить задержки и ошибки, проверить эффект исправлений."
---

# Karma Load (local)

Stress the backend on the local machine to find **what breaks and why** — bugs, bottlenecks, slow queries, leaks, deadlocks, connection-pool ceilings — and turn findings into tasks, before going to production.

## Scope and execution

An audit, research, or planning request produces findings and a proposed next step, without changing application code or project instructions. An explicit implementation/fix request authorizes the necessary in-scope edits and verification; do not ask for the same approval again. Ask only when a material choice or expansion remains unresolved. Honor the host's actual plan/read-only mode; do not assume a keyboard shortcut or switch modes yourself. Commit and push only when authorized by the task or applicable project instructions.

## Scope and honesty (read first)

- **Local only.** The app and the load generator run on one machine.
- This finds problems and measures **relative** change (is it better/worse after a fix). It does **not** produce production-valid absolute RPS limits: the generator and the app share the same hardware, and local hardware is not the production instance. **Always state this caveat** in reports; never claim "holds X rps in prod" from a local run.
- Optimize for finding bottlenecks and bugs, not for a vanity rps number.

## Operating rules

- Honor the requested scope: inspect for an audit, run bounded local tests when requested, and fix bottlenecks when fixes are authorized. Ask only about missing load targets or a material expansion.
- Do not change app behavior or public contracts while fixing bottlenecks beyond what the user approves — keep fixes minimal and behavior-preserving.
- **Docker is nice-to-have, not required** — use whatever run method the project already has.

## How the app runs (detect, don't impose)

- Detect the run method: a `Dockerfile`/`docker-compose.yml` -> use it (brings dependencies up in one command, and is closer to prod). No Docker -> run natively per README/manifests and bring up dependencies the way the project already does.
- Use an isolated test stack with its own Compose project name, disposable database/volumes and synthetic data. Check effective dependency endpoints: a local app may still connect to a production database, email, payment or other external service. Disable real outbound effects or use test substitutes. Record the resources that existed before the run and those created by it.
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

If clear bottlenecks for the target load exist, produce a **plan as a list** — each item: **problem / why it matters / how to fix**. (For broad code discovery, delegate to a subagent if available, inheriting the session model and reasoning settings; verify findings before acting.)

Present the findings. If fixes were requested, continue within that scope; otherwise finish the diagnosis without editing application code.

## Stage 2 — Make approved fixes

Before editing, capture a bounded baseline under the same scenario and dataset used for comparison. If no baseline can be captured, state that relative improvement is not yet measured. Apply authorized fixes as minimal connected diffs, then rerun the scenario.

## Stage 3 — Load test plan (GATE)

Define the plan before running:

- **SLOs = the pass/fail criteria, not raw rps.** E.g. p95 < X ms, p99 < Y ms, error rate < Z%, and latency stable over time (no upward drift under sustained load).
- **Realistic scenario mix** (read/write, multiple endpoints weighted by expected traffic, think-time) — not one flat URL hammered.
- **Ramp stages:** user-supplied targets (e.g. 1k, 3k, 5k rps). Include a short **soak** (sustained load) to catch leaks and connection exhaustion that a 30-second peak hides.

State the scenario, duration and resource limits. An existing request to run local load testing authorizes the bounded run; ask only if targets or potentially disruptive effects remain unresolved. Stop on resource exhaustion, unexpected external traffic or error rates beyond the declared abort threshold.

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

Clean up only resources recorded as created for this run. Stop only owned processes/containers; remove only explicitly identified disposable test volumes/data. Never run blanket volume removal on an existing Compose project, stop pre-existing services, or clean a shared database. Preserve pre-existing resources and report anything intentionally retained.

## Anchor perf hotspots in AGENTS.md (after authorized work)

Capture the performance-sensitive spots and the bottlenecks you fixed, so future code doesn't reintroduce them. As a standard final step, write/refresh this skill's sub-block in the umbrella `karma-toolkit` block in the applicable project `AGENTS.md` (root for project-wide rules, scoped file for local rules). Update this note as part of authorized implementation or an explicit request to maintain project conventions. A read-only audit/research request only proposes the note; it does not write it. Record confirmed facts and adopted decisions, never recommendations as established policy. Read applicable AGENTS.md instructions first and preserve their scope and existing rules. Touch only your own `<!-- karma-load:start/end -->` sub-block; idempotent on the markers — no umbrella block yet → append it at the end of the file (create `AGENTS.md` if absent); your sub-block already present → replace its body, never duplicate; leave other skills' sub-blocks intact. If the umbrella exists but this sub-block is missing, insert it before the umbrella end marker instead of appending another umbrella. Do not overwrite conflicting existing conventions; surface the conflict.

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
