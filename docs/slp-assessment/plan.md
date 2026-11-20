# Deferred assessment implementation plan

Status: design only. The current SLP practice flow remains non-diagnostic and does not retain recordings.

## Order

1. Define consent, retention, access, and deletion policy.
2. Build clinician-reviewed content and prompt versions.
3. Add private recording storage with short-lived access.
4. Add manual review revisions and approval conflicts.
5. Add deterministic report generation from approved revisions.
6. Validate timing and fluency measures on reviewed fixtures.
7. Evaluate models only after licensed data and clinical review.

## Release gates

- [ ] Guardian, patient, clinician, and withdrawal flows are approved.
- [ ] Audio access is encrypted, scoped, logged, and revocable.
- [ ] Reports expose protocol, denominator, uncertainty, and provenance.
- [ ] Approved revisions are immutable and superseded visibly.
- [ ] Model metrics are validated against clinician-reviewed fixtures.
- [ ] No model output writes SOAP notes or diagnoses automatically.

See [platform](SPEC-platform.md), [modules](SPEC-modules.md), and the [active task ledger](../../tasks/todo.md).
