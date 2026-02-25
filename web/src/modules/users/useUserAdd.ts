import { useState } from "react";
import { isAxiosError } from "axios";
import { addClinician, addAdmin } from "~/api/users";

import { ErrorResponse } from "~/models/system";
import { PermissionKey } from "~/models/user/permissions";

export function registerClinician() {
  const [errors, setErrors] = useState<ErrorResponse | null>(null);
  const initialForm = {
    email: "",
  };
  const [form, setForm] = useState(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addClinicianMutation = addClinician();

  async function handleSubmit() {
    setErrors(null);
    try {
      await addClinicianMutation.mutateAsync(form);
      return true;
    } catch (error: unknown) {
      setErrors(isAxiosError(error) ? (error.response?.data ?? null) : null);
      return false;
    } finally {
      setForm(initialForm);
    }
  }

  const resetState = () => {
    setErrors(null);
    setForm(initialForm);
  };

  return {
    form,
    errors,
    isLoading: addClinicianMutation.isPending,
    handleChange,
    handleSubmit,
    resetState,
  };
}

export function registerAdmin() {
  const [errors, setErrors] = useState<ErrorResponse | null>(null);
  const initialForm = {
    email: "",
    abilities: [] as PermissionKey[],
  };
  const [form, setForm] = useState(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      abilities: checked
        ? [...prev.abilities, value as PermissionKey]
        : prev.abilities.filter((p) => p !== value),
    }));
  };

  const addAdminMutation = addAdmin();

  async function handleSubmit() {
    setErrors(null);
    try {
      await addAdminMutation.mutateAsync(form);
      return true;
    } catch (error: unknown) {
      setErrors(isAxiosError(error) ? (error.response?.data ?? null) : null);
      return false;
    } finally {
      setForm(initialForm);
    }
  }

  const resetState = () => {
    setErrors(null);
    setForm(initialForm);
  };

  return {
    form,
    errors,
    isLoading: addAdminMutation.isPending,
    handleChange,
    handlePermissionChange,
    handleSubmit,
    resetState,
  };
}
