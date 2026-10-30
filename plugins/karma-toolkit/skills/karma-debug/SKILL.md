---
name: karma-debug
description: Диагностика конкретного сбоя через воспроизведение и проверку гипотез; по поручению исправление причины с регрессионной проверкой.
---

# Karma Debug

Use for a concrete bug, failing test or unexplained behavior. Broad quality reviews belong to karma-loop; release readiness belongs to karma-preflight.

## Requested outcome

- **Diagnose / explain why:** reproduce where possible, isolate the cause and report evidence plus a proposed correction. Do not change application behavior or persistent project instructions.
- **Fix:** authorizes a minimal in-scope correction and validation. Do not ask again before every experiment, test or code edit.

Ask one focused question only if expected behavior, scope or necessary input cannot be established. Continue independent read-only investigation. Distinguish the requested outcome from a symptom the user happened to mention.

## Investigation

1. Read relevant AGENTS.md instructions, inspect existing changes and establish expected versus observed behavior. Capture reproduction conditions: input, environment, versions and failing command. Redact credentials/personal data from evidence.
2. Reproduce with the smallest suitable case in an isolated test environment. If reproduction is unavailable, say so and use logs/static evidence without claiming a confirmed cause.
3. Trace the failing path and dependencies. Form a small set of competing hypotheses, each with evidence that would refute it. Test one meaningful variable at a time. Prefer targeted experiments over speculative edits.
4. For complex cases maintain an evidence ledger: observation, hypothesis, experiment, result, confidence. Separate facts from assumptions. Reassess failed hypotheses; do not accumulate unrelated patches or repeat unchanged attempts.
5. Confirm how the identified condition produces the symptom. Use independent read-only review for consequential or ambiguous diagnoses when available; inherit session model/reasoning unless instructed otherwise.

## Correction and proof

For a fix request, write a behavioral regression test and observe the relevant failure before changing production code when practical. Make the smallest correction and run the test green. For hardware/UI/environment bugs without a useful automated test, document a repeatable before/after check and its limits.

Run nearby regression checks proportional to the affected surface. Do not weaken assertions, disable checks, swallow errors or change public behavior merely to hide the symptom. Functional expansion beyond the requested fix needs a user decision.

Preserve pre-existing changes. Clean up only temporary resources created for this investigation. Repository/credential access does not authorize production mutations. Commit/push only when already authorized.

Update an existing test catalog when changing tests, preserving its path and recording actual verification. Add a concise AGENTS.md invariant only when the authorized fix establishes a durable, non-obvious convention. Do not turn one-off workarounds into universal rules, duplicate managed blocks, or write instructions during diagnosis-only work.

## Completion

Report expected versus observed behavior, established cause (or ranked unconfirmed hypotheses), evidence, changed files, actual check results and limitations. A disappearance of the symptom without a causal explanation is not a confirmed root cause. If blocked, preserve findings and state the smallest missing input.
