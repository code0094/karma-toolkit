---
name: karma-logs
description: Audit a backend's observability and logging readiness before production — when it breaks, will you be able to see what and why? Checks for structured logging, coverage of key events (requests, errors, auth, external calls), secrets/PII leaking into logs, metrics, tracing, alerting, health checks, and prod log hygiene. Detects the stack and existing tooling, reports gaps as a prioritized checklist, and adds logging only on approval. Honest: observability lets you SEE problems, it does not prevent them.
---

# Karma Logs

Before production, answer one question: **when this breaks at 3am, will we be able to see what broke and why?** Audit observability readiness, report the gaps, and optionally fill them.

## Plan-first contract

By default this skill produces a **discussable plan, not changes**. It ends its analysis with a prioritized list of what it proposes to do — *what / why / where* — then **stops for discussion and approval**. Changes happen only after an explicit go-ahead, as a separate execution phase. For hard enforcement, run the skill in plan mode (Shift+Tab), where edits are blocked until you approve.

## Honesty contract

- Observability lets you **detect and diagnose** problems faster; it does **not** prevent them. Good logs do not mean fewer bugs — they mean shorter time-to-diagnosis.
- "Has logging" is not "has useful logging". Logs that omit context, or that log nothing on the failure path, are theater. Judge usefulness, not presence.

## What this skill touches

- **Audit by default** — it only reports gaps. It adds or changes logging code **only on approval**, as minimal diffs, and never changes application behavior.

## Detect first (don't impose tools)

Detect the stack and what is already present — logging library, metrics library, error tracker (e.g. Sentry), OpenTelemetry, a log aggregator, health endpoints — from dependencies and config. Where gaps exist, recommend popular open-source tooling that fits the stack; prefer what the project already uses over introducing something new.

## Audit dimensions

1. **Structured logging** — a real logger (not scattered `print`/`console.log`), structured output (JSON), severity levels (debug/info/warn/error), and request/trace-id correlation so one request's lines can be tied together.
2. **Coverage of key events** — incoming requests, errors/exceptions **with context** (not just the message), auth events, important business operations, and external calls (DB/API) with timings. Flag **swallowed exceptions that log nothing** (this overlaps karma-security A09/A10 and the silent-failure smell from karma-refactoring).
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

Don't add logging by default. Present the gap list and let the user approve. On approval, add minimal structured logging / instrumentation as small diffs — no behavior change, no chatty debug spam.

## Final report

- What's covered, what's still blind.
- Top gaps with priority (secrets-in-logs / error-path blindness first).
- Honest framing: observability is diagnosis capability, not a guarantee of correctness.
- Pairs with **karma-load** (provides the server-side metrics you watch during a load test) and **karma-security** (logs must not leak secrets; A09 alerting).
