# SLP assessment assistance: capability map

Date: 2026-10-30. Status: proposed specification and implementation plan; no implementation or clinical validation implied.

Source: [RECOM_SLP.md](../../RECOM_SLP.md). This proposal follows its assessment-assistance scope and phase order. [PLAN_SLP.md](../../PLAN_SLP.md) describes a different practice-oriented proposal: preserve it, but do not import automatic coaching, training, or pediatric-only scope into this assessment initiative. The existing phoneme-analysis migration contract remains valid for the legacy endpoint; stored recordings and queued analysis below are an explicit new contract.

The user requested both specifications and planning with technical decisions delegated, so these artifacts are supplied together for review. Existing `tasks/plan.md` and `tasks/todo.md` belong to other work and are preserved. This directory is the task-list location for this initiative.

| Stable module | Responsibility | Depends on |
| --- | --- | --- |
| slp-content | Versioned exercises, assets, protocols, role-scoped CRUD | Existing identity/audit |
| slp-capture | Assignments, consent, recording lifecycle | slp-content, existing clinician-patient relationship |
| slp-analysis | Queued processing, quality, timing, fluency candidates | slp-capture |
| slp-review | Clinician corrections, approval, reports, comparisons | slp-analysis |

Build order: content → capture → manual analysis/review → timing automation → fluency detector validation. Each capability is specified in [SPEC-modules.md](SPEC-modules.md), with shared contracts in [SPEC-platform.md](SPEC-platform.md). Execution order and checks: [plan.md](plan.md).

Assumptions: authenticated home users; an assigned qualified clinician; English and Filipino/Tagalog independently reviewed content; no existing caregiver authorization assumed; no model-training consent inferred. Adult self-use ships first if verified guardian authorization is unavailable. Pediatric use remains a supported design target, gated by that authorization and age-appropriate content. No normative age scores, diagnosis, or patient-facing machine scores.
