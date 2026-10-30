---
name: karma-ui-deslop
description: Inspect a rendered interface for generic visual patterns, content gaps and usability defects, then produce and verify a corrected responsive mockup. Use for UI de-slopping, visual audits with proposed redesigns, and before/after interface comparisons.
---

# Karma UI Deslop

Improve the existing screen for its actual audience and task. Deliver observable findings and a browser-checked mockup that demonstrates the corrections.

## Establish the outcome

Read the user's request, applicable AGENTS.md, existing design system and relevant UI. Identify the screen's job, primary action, required content, brand choices and reachable states. Preserve existing work.

If invocation alone leaves the desired outcome unspecified, ask once: audit only, audit plus corrected mockup, or implementation in the product. Use an already specified outcome without asking again. For audit plus mockup, create an isolated preview; a request to change the product authorizes the corresponding scoped implementation. Ask only about missing choices that would materially change the result; infer routine details from the project and state consequential assumptions.

## Inspect before deciding

Open the current interface at representative desktop and mobile sizes, including a reported failing size. Record the same routes, data and states for comparison. Read the source where available; exercise relevant controls. If only an image is available, label behavior and implementation unknown.

First judge the screen as a whole: what leads, what the user can do, what already works. Then read and complete all 48 items in [references/checklist.md](references/checklist.md) for the agreed screen or flow. Record each item's disposition and concrete observation; do not substitute a few general impressions or a code search for this sweep. Use [references/catalogue.md](references/catalogue.md) for corrections and contextual exceptions. A landing page, dense operational tool and editorial page need different hierarchy and density.

Classify a proposed finding as:
- **Defect:** observed clipping, inaccessible content, misleading state, broken interaction or another demonstrated failure.
- **Contextual pattern:** repeated/default treatment that demonstrably weakens this screen's hierarchy, specificity, clarity or consistency.
- **Optional direction:** a defensible stylistic alternative, not a defect.

A popular font, gradient, centered heading, three-column grid or familiar component is insufficient evidence by itself. Explain its actual effect here. Preserve deliberate brand decisions and effective conventions. Do not infer AI authorship, fake data or user intent from appearance. Source literals and scanner matches are leads to verify, not automatic violations.

For CH14, distinguish typography required by the user or an applicable design system from fonts merely present in the source. Inspect the whole typographic treatment, not just family names; readability alone does not settle whether it fits this project's character. Read [references/typography.md](references/typography.md) when the choice is unconstrained and looks generic, typography is newly selected, or the user questions repetitive font choices. In authorized mockup/redesign work, use its small visual comparison to resolve that choice; audit-only work reports it without generating redesigns.

For each material finding record location/state, observable evidence, effect, correction and priority. Record untested checks as unknown; a screenshot cannot establish keyboard behavior, semantics, complete accessibility or motion. Report material findings without burying them under cosmetic suggestions.

## Check content before composition

Read [references/editorial.md](references/editorial.md) when evaluating user-facing copy. Identify what visitors need to understand or decide, which supplied facts support it, and what is missing or inconsistent. Distinguish editorial padding from missing product information; polished wording cannot establish dates, prices, evidence or working destinations. Ask for missing facts only when they materially block the requested result; keep progressing on independent corrections and report other gaps together.

Honor the requested scope: audit-only reports findings; visual-only or verbatim-copy work preserves wording and flags suggestions. When improving content is already authorized, include editorial work without asking the user to invoke another skill. Resolve information priorities before arranging the mockup.

## Correct coherently

Choose the smallest coherent set of changes that settles the findings. Use existing components, fonts, semantic colors and spacing conventions where they work. A different composition is appropriate when hierarchy or workflow requires it; a fresh palette is not a substitute for composition.

Keep a content/action inventory: facts, source wording, values, prices, links, fields, handlers, navigation and relevant states. Track authorized wording changes separately so semantic preservation does not require identical strings. Correct layout around real content, including long labels. Do not improve the picture by removing inconvenient content or actions, inventing proof, changing brand identity or fabricating backend success. Mark prototype-only behavior visibly. Preserve useful grouping and information density; functional tables may scroll horizontally inside an intentional region.

At narrow widths, perform the primary task from the first visible part of each item. Check whether its deciding fields (for example status, deadline or availability) and action are actually accessible together. Contained scrolling is a layout option, not proof of task usability; use a compact alternate representation or pinned priority fields when the task requires them. Keep a comparison table when cross-column comparison is the task, and explain the tradeoff.

Preserve intended behavior rather than incidental implementation bugs. A local demo may faithfully simulate its stated action without a backend if clearly labeled. In forms and stateful tools, exercise change-after-success and interrupted/repeated actions so stale success, pending timers and lost drafts do not contradict the current state. Keep feedback close to the action it answers; one global notice may be unsuitable for unrelated regions.

Distinguish the intended product action from the prototype's connection status. Missing audio, APIs, credentials or a backend is not a reason to remove Play, Save, Export or another established task, or replace it with an unrelated information action. Preserve the action's role and label; show an explained unavailable state or an explicitly labeled local simulation. Do not report simulated execution as real success. Before accepting each correction, check whether it improves the user's task or merely makes a checklist finding disappear.

If the original is already effective, keep it and explain why suspected patterns are appropriate. A corrected mockup may retain most or all of the original. Offer multiple directions only when there is a substantive unresolved choice; one verified correction is the default. A focused typography comparison resolves such a choice without requiring multiple full-page redesigns.

## Edit copy before final rendering

When copy editing is in scope, use `karma-humanize` if available: read its instructions and applicable language references, and apply the UI constraints in [references/editorial.md](references/editorial.md). If unavailable, use that reference's conservative editing fallback and disclose that the separate skill was not run; do not install it automatically. Keep effective copy unchanged. Finish editing before final browser checks, since wording affects wrapping, component sizes and accessible names.

## Render and compare

Use the project's stack or a small self-contained HTML preview appropriate to the scope. Reuse existing tooling; no external design service or specific UI library is required. Open the result in a real browser, inspect desktop/mobile renders, exercise preserved actions and affected states, and check long content. Source inspection alone does not verify visual success.

Compare before/after at identical viewport sizes, data and states. Revisit the checklist against the final render: record which findings are resolved, which patterns remain intentionally, and whether a replacement introduced another template. Check the content/action inventory and whether the old screen did anything better. Fix material regressions in one batch and verify the affected checks again. Stop after one correction batch plus confirmation unless the user requests more; report remaining issues honestly. If browser inspection is unavailable, deliver the preview with that limitation, never a claimed visual pass.

Verify the delivery surface too. A report that works through `file://` may fail in an isolated chat preview. For a self-contained preview, embed required images, styles, scripts and fonts, and avoid links that depend on sibling files or blocked popups/frames. Test the actual viewer or its documented restrictions; state when only an equivalent sandbox was tested.

## Deliver

Provide the preview path or URL, desktop/mobile before/after images or a comparison page, the material visual and copy changes, preserved behavior actually checked, and remaining unknowns. Collect unresolved content needs into a short list of specific facts or assets required from the user. Keep explanation proportional to the work. An audit-only request ends with findings; implementation belongs to the scope the user selected.

Include the completed checklist in the audit artifact or an expandable section of the comparison; for audit-only chat output, use a compact table. Summarize consequential findings in the main response rather than pasting 48 rows there. Never report an AI-authorship probability or a quality score derived from the number of matching patterns.

The detailed sources and adaptation boundaries are in [references/sources.md](references/sources.md).
