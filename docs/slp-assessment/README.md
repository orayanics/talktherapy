# Deferred SLP assessment design

This directory describes a future clinician-facing assessment workflow. It is not implemented by the current practice endpoint.

## Scope

- Clinicians review recordings and correct model candidates.
- Reports use approved revisions and visible provenance.
- Patients receive clinician-released results only.
- Metrics preserve missing, uncertain, and insufficient data.
- No diagnosis or treatment decision is automated.
- No recording retention occurs without explicit consent and policy.

## Documents

- [Platform specification](SPEC-platform.md): storage, access, review, and release contracts.
- [Module specification](SPEC-modules.md): content, capture, analysis, and review phases.
- [Implementation plan](plan.md): deferred work and release gates.

The active practice implementation is documented in the [phoneme-analysis specification](../migration/modules/SPEC-phoneme-analysis.md).
