import React, { useState } from "react";
import { useRegisterPatient } from "~/api/auth";
import { PatientRegisterPayload } from "~/models/user/credentials";
import { isAxiosError } from "axios";
import { ParsedError, parseError } from "~/utils/errors";

export default function usePatientRegister() {
  const [errors, setErrors] = useState<ParsedError | null>(null);
  const [form, setForm] = useState<PatientRegisterPayload>({
    name: "",
    diagnosis_id: "",
    email: "",
    password: "",
    password_confirmation: "",
    consent: false,
  });

  const handleConsent = (isConsent: boolean) => {
    setForm((prev) => ({ ...prev, consent: isConsent }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };
  const register = useRegisterPatient();

  async function handleSubmit() {
    setErrors(null);
    try {
      await register.mutateAsync(form);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        setErrors(parseError(error.response?.data));
      } else {
        setErrors(null);
      }
    }
  }

  return {
    form,
    errors,
    isLoading: register.isPending,
    handleConsent,
    handleChange,
    handleSubmit,
  };
}
