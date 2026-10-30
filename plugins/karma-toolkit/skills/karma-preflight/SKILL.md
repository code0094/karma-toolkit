---
name: karma-preflight
description: Проверить готовность релиза по тестам, нагрузке, безопасности, наблюдаемости, миграциям и откату; собрать полный список блокеров.
---

# Karma Preflight

Evaluate an explicitly scoped release. Passed checks are evidence, not a guarantee of production safety. Preflight does not authorize deployment.

## Scope

Inspect code/configuration and run existing checks in suitable disposable test environments. Do not change application code, test suites or project conventions for an audit request. Tests/load can have side effects: verify targets and ownership before running them. Fixes require a fix request or already established implementation authorization.

Identify release/ref, relevant environment and required versus optional stages. Preserve existing release criteria. A stage cannot become optional just because it failed or its tool is missing.

## Stages

Use matching installed skills, passing mode and scope explicitly. Do not reinitialize a delegated stage's user questionnaire.

1. **Tests → karma-tests, audit mode.** Inspect critical scenario coverage and run relevant existing suites. Core untested flows or regressions block release; do not write tests during preflight.
2. **Load → karma-load, measurement only.** Use an isolated local environment and bounded scenario if applicable. No application fixes. Crashes/leaks at required load block release. Local results do not establish production capacity.
3. **Security → karma-security, audit mode.** Separate confirmed findings from unverified candidates. Confirmed critical/high issues block release; inability to verify required checks remains unresolved.
4. **Observability → karma-logs, audit mode.** Check error-path diagnostics, log leakage and project operational requirements.
5. **Additional release checks:** redacted secret scanning; required configuration without exposing values; migration compatibility and locking/data-loss risk; credible rollback or forward-recovery procedure. Do not require a destructive down-migration when expand/contract or forward-fix is safer.

If a skill/tool or environment is missing, mark the check unavailable with its reason. If a stage is inapplicable, record why. Continue all independent safe checks after finding a blocker. Skip dependent or unsafe checks and state why.

## Verdict

For each stage report: required/optional, pass/warn/blocker/not applicable/not checked, supporting command/evidence, remaining work.

- **GO:** all applicable required checks ran and passed, with no unresolved release blockers. Include optional warnings and residual risks.
- **NO-GO:** a required check failed, was not run, could not be verified, or a release blocker remains. Distinguish confirmed failure from missing evidence.

Report the full blocker list and smallest corrective steps. Do not silently repair issues, rewrite AGENTS.md, publish or deploy. A later fix request can reuse findings without repeating approvals already given.
