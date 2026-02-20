import {
  useMutation,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { api } from "~/api/axios";

import {
  LoginPayload,
  PatientRegisterPayload,
  UpdateUserPayload,
} from "~/models/user/credentials";

// query options
export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    try {
      const { data } = await api.get("/auth/session");
      return data.user ?? null;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return null; // unauthenticated is not an error state
      }
      throw error; // network errors, 500s — still throw
    }
  },
  staleTime: 1000 * 60 * 5,
  retry: false,
});

// mutations
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post("/auth/login", payload);
      return data;
    },
    onSuccess: async () => {
      localStorage.setItem("talktherapy_session", "true");
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate({ to: "/dashboard" });
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: async () => {
      localStorage.removeItem("talktherapy_session");
      queryClient.removeQueries({ queryKey: ["session"] });
      navigate({ to: "/login" });
    },
  });
};

export const useRegisterPatient = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PatientRegisterPayload) => {
      await api.post("/auth/signup/patient", payload);

      await api.post("/auth/login", {
        email: payload.email,
        password: payload.password,
      });
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["session"] });
      router.navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Registration failed:", error.response?.data);
      }
    },
  });
};

export const useEditProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const { data } = await api.put("/auth/update-user", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      navigate({ to: "/profile" });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Profile update failed:", error.response?.data);
      }
    },
  });
};
