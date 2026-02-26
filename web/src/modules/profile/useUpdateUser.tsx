import React, { useState } from "react";
import { isAxiosError } from "axios";

import { UpdateUserPayload } from "~/models/user/credentials";

import { useEditProfile } from "~/api/auth";
import { ParsedError, parseError } from "~/utils/errors";

export default function useUpdateUser({ name }: { name: string }) {
  const [errors, setErrors] = useState<ParsedError | null>(null);
  const [form, setForm] = useState<UpdateUserPayload>({
    name: name,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors(null);
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateUserMutation = useEditProfile();

  async function handleSubmit() {
    setErrors(null);
    try {
      await updateUserMutation.mutateAsync(form);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        setErrors(parseError(error.response.data));
      } else {
        setErrors(null);
      }
    }
  }

  return {
    form,
    errors,
    handleChange,
    handleSubmit,
    isLoading: updateUserMutation.isPending,
  };
}
