import React, { useState } from "react";
import { ErrorResponse } from "~/models/system";
import { CreateSchedulePayload } from "~/models/schedule";
import { useCreateSchedule } from "~/api/scheduling";
import { CreateAvailabilityPayload } from "~/models/schedule";
import { toISODateTime } from "~/utils/date";
import { buildRRule } from "~/utils/rrule";
import { differenceInDays, addMonths } from "date-fns";

export default function useSchedule() {
  const [errors, setErrors] = useState<ErrorResponse | null>(null);
  const [form, setForm] = useState<CreateSchedulePayload>({
    date: "",
    start_time: "",
    end_time: "",
    freq: "none",
    selected_days: [],
    horizon_days: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      selected_days: prev.selected_days.includes(day)
        ? prev.selected_days.filter((d) => d !== day)
        : [...prev.selected_days, day],
    }));
    setErrors((prev) => ({ ...prev, selected_days: undefined }));
  }

  const scheduleMutation = useCreateSchedule();

  async function handleSubmit() {
    setErrors(null);

    try {
      const days = parseInt(form.horizon_days.toString(), 10);
      const horizonDays =
        form.freq === "MONTHLY"
          ? differenceInDays(
              addMonths(new Date(form.date), days),
              new Date(form.date),
            )
          : days;

      const payload: CreateAvailabilityPayload = {
        starts_at: toISODateTime(form.date, form.start_time),
        ends_at: toISODateTime(form.date, form.end_time),
        horizon_days: horizonDays,
      };

      const rrule = buildRRule(form.freq, form.selected_days);
      if (rrule) payload.recurrence_rule = rrule;

      await scheduleMutation.mutateAsync(payload);
    } catch (error: any) {
      setErrors(error.response?.data ?? null);
    }
  }

  return {
    form,
    errors,
    isLoading: scheduleMutation.isPending,
    handleChange,
    handleSubmit,
    toggleDay,
  };
}
