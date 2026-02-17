import React, { useState } from "react";
import { LoginPayload } from "~/models/user/credentials";
import { ErrorResponse } from "~/models/system";
import { login } from "~/api/auth";

export default function useLogin() {
  const [errors, setErrors] = useState<ErrorResponse | null>(null);
  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loginMutation = login();
  async function handleSubmit() {
    setErrors(null);
    try {
      await loginMutation.mutateAsync(form);
    } catch (error: any) {
      setErrors(error.response?.data ?? null);
    }
  }

  return {
    form,
    errors,
    isLoading: loginMutation.isPending,
    handleChange,
    handleSubmit,
  };
}
