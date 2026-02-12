import React, { useState } from "react";
import { useRegisterPatient } from "~/api/auth";
import { PatientRegisterPayload } from "~/models/user/credentials";

export default function usePatientRegister() {
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
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
    } catch (error: any) {
      setErrors(error.response?.data?.errors ?? null);
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
