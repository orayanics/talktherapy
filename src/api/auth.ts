import {
  useMutation,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api } from "~/api/axios";

import {
  LoginPayload,
  PatientRegisterPayload,
} from "~/models/user/credentials";

export const login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api().post("/auth/login", payload);
      localStorage.setItem("token", data.token);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await queryClient.refetchQueries({ queryKey: ["session"] });
      navigate({ to: "/dashboard" });
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api().post("/auth/logout");
      localStorage.removeItem("token");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await queryClient.refetchQueries({ queryKey: ["session"] });
      navigate({ to: "/login" });
    },
  });
};

export const fetchSession = async () => {
  // const { data } = await api().get("/auth/me");
  // return data;
  try {
    const { data } = await api().get("/auth/me");
    return data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      return null;
    }
    throw error;
  }
};

export const useGetSession = queryOptions({
  queryKey: ["session"],
  queryFn: () => fetchSession(),
});

export const useRegisterPatient = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload: PatientRegisterPayload) => {
      const { data } = await api().post("/auth/register/patient", payload);
      return data;
    },
    onSuccess: () => {
      navigate({ to: "/dashboard" });
    },
  });
};
