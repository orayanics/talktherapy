import React from "react";
import { Freq } from "~/models/schedule";
import { DAYS } from "~/utils/rrule";
import { useRouter } from "@tanstack/react-router";

import useSchedule from "./useSchedule";

export default function ScheduleForm() {
  const router = useRouter();
  const { form, errors, isLoading, handleChange, handleSubmit, toggleDay } =
    useSchedule();
  return (
    <div style={styles.page}>
      <style>{cssVars}</style>

      {/* Header */}
      <header style={styles.header}>
        <button
          type="button"
          onClick={() => router.history.back()}
          style={styles.backBtn}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <div>
          <p style={styles.headerEyebrow}>Scheduling</p>
          <h1 style={styles.headerTitle}>New Availability</h1>
        </div>
      </header>

      {/* Form Card */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        style={styles.card}
        noValidate
      >
        {/* Root error */}
        {errors && (
          <div style={styles.rootError}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="7"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 5V8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="8" cy="11" r="0.75" fill="currentColor" />
            </svg>
            {errors.message instanceof Object
              ? errors.message.response
              : errors.message}
          </div>
        )}

        {/* Section: Date & Time */}
        <section style={styles.section}>
          <h2 style={styles.sectionLabel}>
            <span style={styles.sectionDot} />
            Date &amp; Time
          </h2>

          <div style={styles.row}>
            <Field label="Date" error={errors?.errors?.date} required>
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors?.errors?.date ? styles.inputError : {}),
                }}
              />
            </Field>
          </div>

          <div style={styles.row}>
            <Field
              label="Start Time"
              error={errors?.errors?.start_time}
              required
            >
              <input
                type="time"
                value={form.start_time}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors?.errors?.start_time ? styles.inputError : {}),
                }}
              />
            </Field>
            <Field label="End Time" error={errors?.errors?.end_time} required>
              <input
                type="time"
                value={form.end_time}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors?.errors?.end_time ? styles.inputError : {}),
                }}
              />
            </Field>
          </div>
        </section>

        <Divider />

        {/* Section: Recurrence */}
        <section style={styles.section}>
          <h2 style={styles.sectionLabel}>
            <span style={styles.sectionDot} />
            Recurrence
          </h2>

          <div style={styles.freqGrid}>
            {(["none", "DAILY", "WEEKLY", "MONTHLY"] as Freq[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() =>
                  handleChange({ target: { name: "freq", value: f } })
                }
                style={{
                  ...styles.freqBtn,
                  ...(form.freq === f ? styles.freqBtnActive : {}),
                }}
              >
                {f === "none"
                  ? "One-time"
                  : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {form.freq === "WEEKLY" && (
            <div style={styles.dayPickerWrap}>
              <p style={styles.fieldLabel}>
                Days
                <span style={styles.required}>*</span>
              </p>
              <div style={styles.dayGrid}>
                {DAYS.map((d) => {
                  const active = form.selected_days.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      style={{
                        ...styles.dayBtn,
                        ...(active ? styles.dayBtnActive : {}),
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              {errors?.errors?.selected_days && (
                <p style={styles.errorText}>{errors.errors.selected_days}</p>
              )}
            </div>
          )}
        </section>

        {form.freq !== "none" && (
          <>
            <Divider />
            <section style={styles.section}>
              <h2 style={styles.sectionLabel}>
                <span style={styles.sectionDot} />
                Expansion Window
              </h2>

              <Field
                label={`Generate slots for the next ${form.horizon_days} day${form.horizon_days !== 1 ? "s" : ""}`}
              >
                <div style={styles.sliderWrap}>
                  <span style={styles.sliderLabel}>1</span>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={form.horizon_days}
                    onChange={handleChange}
                    style={styles.slider}
                  />
                  <span style={styles.sliderLabel}>30</span>
                </div>
                <p style={styles.helperText}>
                  Slots will be pre-generated up to {form.horizon_days} day
                  {form.horizon_days !== 1 ? "s" : ""} from today. Maximum is 30
                  days.
                </p>
              </Field>
            </section>
          </>
        )}

        <Divider />

        {/* Preview */}
        <section style={styles.section}>
          <h2 style={styles.sectionLabel}>
            <span style={styles.sectionDot} />
            Preview
          </h2>
          <div style={styles.preview}>
            <PreviewRow label="Date" value={form.date || "—"} />
            <PreviewRow
              label="Time"
              value={
                form.start_time && form.end_time
                  ? `${form.start_time} → ${form.end_time}`
                  : "—"
              }
            />
            <PreviewRow
              label="Recurrence"
              value={
                form.freq === "none"
                  ? "One-time"
                  : form.freq === "WEEKLY" && form.selected_days.length > 0
                    ? `Weekly on ${form.selected_days.join(", ")}`
                    : form.freq === "WEEKLY"
                      ? "Weekly (no days selected)"
                      : form.freq.charAt(0) + form.freq.slice(1).toLowerCase()
              }
            />
            {form.freq !== "none" && (
              <PreviewRow label="Window" value={`${form.horizon_days} days`} />
            )}
            {form.start_time && form.end_time && (
              <PreviewRow
                label="Slot duration"
                value={formatDuration(form.start_time, form.end_time)}
              />
            )}
          </div>
        </section>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            type="button"
            onClick={() => router.history.back()}
            style={styles.cancelBtn}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              ...(isLoading ? styles.submitBtnDisabled : {}),
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={styles.spinnerRow}>
                <Spinner /> Creating…
              </span>
            ) : (
              "Create Schedule"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string | undefined;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      {children}
      {error && <p style={styles.errorText}>{error}</p>}
    </div>
  );
}

function Divider() {
  return <hr style={styles.divider} />;
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.previewRow}>
      <span style={styles.previewLabel}>{label}</span>
      <span style={styles.previewValue}>{value}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(start: string, end: string): string {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const total = eh * 60 + em - (sh * 60 + sm);
  if (total <= 0) return "—";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const cssVars = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(to right, #0EA5E9 0%, #0EA5E9 var(--val, 100%), #E2E8F0 var(--val, 100%), #E2E8F0 100%);
    outline: none;
    cursor: pointer;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #0EA5E9;
    box-shadow: 0 1px 4px rgba(14,165,233,0.3);
    cursor: pointer;
  }
  input[type="date"], input[type="time"] {
    color-scheme: light;
  }
`;

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Sora', sans-serif",
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    padding: "32px 24px 80px",
    maxWidth: 680,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 28,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748B",
    fontSize: 13,
    fontFamily: "inherit",
    fontWeight: 500,
    padding: "4px 0",
    letterSpacing: "0.01em",
  },
  headerEyebrow: {
    margin: 0,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#0EA5E9",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: 4,
  },
  headerTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 600,
    color: "#0F172A",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)",
  },
  rootError: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "20px 28px 0",
    padding: "12px 16px",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 8,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: 500,
  },
  section: {
    padding: "24px 28px",
  },
  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "0 0 20px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#94A3B8",
    fontFamily: "'JetBrains Mono', monospace",
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#0EA5E9",
    flexShrink: 0,
  },
  divider: {
    margin: 0,
    border: "none",
    borderTop: "1px solid #F1F5F9",
  },
  row: {
    display: "flex",
    gap: 16,
    marginBottom: 0,
  },
  field: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  required: {
    color: "#0EA5E9",
    fontSize: 14,
    lineHeight: 1,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    fontSize: 14,
    fontFamily: "'Sora', sans-serif",
    fontWeight: 400,
    color: "#0F172A",
    background: "#F8FAFC",
    border: "1.5px solid #E2E8F0",
    borderRadius: 8,
    outline: "none",
    transition: "border-color 0.15s",
  },
  inputError: {
    borderColor: "#FCA5A5",
    background: "#FFF9F9",
  },
  errorText: {
    margin: 0,
    fontSize: 12,
    color: "#EF4444",
    fontWeight: 500,
  },
  helperText: {
    margin: "6px 0 0",
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 1.5,
  },
  freqGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
  },
  freqBtn: {
    padding: "10px 8px",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    color: "#475569",
    background: "#F8FAFC",
    border: "1.5px solid #E2E8F0",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "center" as const,
  },
  freqBtnActive: {
    color: "#0EA5E9",
    background: "#F0F9FF",
    borderColor: "#7DD3FC",
    fontWeight: 600,
  },
  dayPickerWrap: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  dayGrid: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap" as const,
  },
  dayBtn: {
    width: 48,
    height: 40,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.03em",
    color: "#475569",
    background: "#F8FAFC",
    border: "1.5px solid #E2E8F0",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  dayBtnActive: {
    color: "#FFFFFF",
    background: "#0EA5E9",
    borderColor: "#0EA5E9",
  },
  sliderWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  slider: {
    flex: 1,
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#94A3B8",
    fontFamily: "'JetBrains Mono', monospace",
    minWidth: 18,
    textAlign: "center" as const,
  },
  preview: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },
  previewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid #F1F5F9",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "#94A3B8",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  },
  previewValue: {
    fontSize: 13,
    fontWeight: 500,
    color: "#0F172A",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "20px 28px",
    background: "#F8FAFC",
    borderTop: "1px solid #F1F5F9",
  },
  cancelBtn: {
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "inherit",
    color: "#64748B",
    background: "#FFFFFF",
    border: "1.5px solid #E2E8F0",
    borderRadius: 8,
    cursor: "pointer",
  },
  submitBtn: {
    padding: "9px 24px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    color: "#FFFFFF",
    background: "#0EA5E9",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "opacity 0.15s",
    letterSpacing: "0.01em",
  },
  submitBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  spinnerRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
};
