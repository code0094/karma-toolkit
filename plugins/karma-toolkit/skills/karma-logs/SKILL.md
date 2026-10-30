---
name: karma-logs
description: Проверить логирование, метрики и диагностику сбоев; по поручению добавить недостающую наблюдаемость.
---

# Karma Logs

Before production, answer one question: **when this breaks at 3am, will we be able to see what broke and why?** Audit observability readiness, report the gaps, and optionally fill them.

## Scope and execution

An audit, research, or planning request produces findings and a proposed next step, without changing application code or project instructions. An explicit implementation/fix request authorizes the necessary in-scope edits and verification; do not ask for the same approval again. Ask only when a material choice or expansion remains unresolved. Honor the host's actual plan/read-only mode; do not assume a keyboard shortcut or switch modes yourself. Commit and push only when authorized by the task or applicable project instructions.

## Honesty contract

- Observability lets you **detect and diagnose** problems faster; it does **not** prevent them. Good logs do not mean fewer bugs — they mean shorter time-to-diagnosis.
- "Has logging" is not "has useful logging". Logs that omit context, or that log nothing on the failure path, are theater. Judge usefulness, not presence.

## What this skill touches

- **Audit by default** — report gaps. An explicit request to implement observability authorizes minimal logging changes without a second approval. Preserve business behavior.

## Detect first (don't impose tools)

Detect the stack and what is already present — logging library, metrics library, error tracker (e.g. Sentry), OpenTelemetry, a log aggregator, health endpoints — from dependencies and config. Where gaps exist, recommend popular open-source tooling that fits the stack; prefer what the project already uses over introducing something new.

## Audit dimensions

1. **Structured logging** — a real logger (not scattered `print`/`console.log`), structured output (JSON), severity levels (debug/info/warn/error), and request/trace-id correlation so one request's lines can be tied together.
2. **Coverage of key events** — incoming requests, errors/exceptions **with context** (not just the message), auth events, important business operations, and external calls (DB/API) with timings. Flag **swallowed exceptions that log nothing** (this overlaps karma-security A09/A10 and is a classic silent-failure smell).
3. **Sensitive data in logs** — secrets, tokens, passwords, PII, card numbers must **not** be logged. Treat any leak as **high priority** — it is a security issue, not just hygiene.
4. **Metrics** — latency, error rate, throughput, and resource use instrumented; a metrics endpoint (e.g. `/metrics`) where applicable.
5. **Tracing** — distributed tracing (e.g. OpenTelemetry) across services/workers if the system spans processes.
6. **Alerting** — alerts on errors/anomalies, or at minimum a clear destination where logs/metrics ship (Sentry/Grafana/CloudWatch...). "Great logging, no alerting" is exactly OWASP A09.
7. **Health/readiness** — `/health` and `/ready` endpoints for orchestrators and uptime checks.
8. **Prod log hygiene** — no debug-level noise left on in production (it both costs money and leaks data), not so verbose it floods, sane rotation/retention.

## Output

- **Readiness checklist** — each dimension: present / missing / weak, with evidence (`file:line`).
- **Prioritized gaps** — secrets-in-logs and no-logging-on-the-error-path come first; cosmetic gaps last.
- Optionally write findings to `notes/<note.md>` -> `tasks/<task.md>` for tracking (same flow as karma-load).

## Fixing (gated)

For an audit, report gaps without edits. When the user requests implementation, add minimal structured logging / instrumentation as small diffs — no behavior change, no chatty debug spam.

## Anchor the logging convention in this project (after authorized work)

Once logging exists in the project, capture **how it works here** so future code follows it (and so the next session knows where to look). As a standard final step, write/refresh this skill's sub-block in the umbrella `karma-toolkit` block in the applicable project `AGENTS.md` (root for project-wide rules, scoped file for local rules). Update this note as part of authorized implementation or an explicit request to maintain project conventions. A read-only audit/research request only proposes the note; it does not write it. Record confirmed facts and adopted decisions, never recommendations as established policy. Read applicable AGENTS.md instructions first and preserve their scope and existing rules. Touch only your own `<!-- karma-logs:start/end -->` sub-block; idempotent on the markers — no umbrella block yet → append it at the end of the file (create `AGENTS.md` if absent); your sub-block already present → replace its body, never duplicate; leave other skills' sub-blocks intact. If the umbrella exists but this sub-block is missing, insert it before the umbrella end marker instead of appending another umbrella. Do not overwrite conflicting existing conventions; surface the conflict.

```
<!-- karma-toolkit:start -->
## karma-toolkit — project conventions (managed; edited by the karma-* skills)

<!-- karma-logs:start -->
Logging here: <how it is actually set up — e.g. structlog -> JSON to stdout; global exception handler in main.py with route/ip context; admin mutations -> audit logger>.
- New feature / endpoint -> check whether there is anything to log (errors, important events) and add it following the same pattern.
- Never log secrets or PII.
<!-- karma-logs:end -->
<!-- karma-toolkit:end -->
```

Fill the first line with the project's **actual** setup (what you found/configured), not a generic placeholder — that line is also the entry point for finding logs in a later session (what to grep, where the handler lives). Do NOT also maintain a separate logger catalog — the block plus grep is enough (loggers are trivially greppable; unlike test coverage they need no vetted index). If logging does not yet exist and this run added none, write nothing.

## Final report

- What's covered, what's still blind.
- Top gaps with priority (secrets-in-logs / error-path blindness first).
- Honest framing: observability is diagnosis capability, not a guarantee of correctness.
- Pairs with **karma-load** (provides the server-side metrics you watch during a load test) and **karma-security** (logs must not leak secrets; A09 alerting).
