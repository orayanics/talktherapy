import {
  useMutation,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { api } from "~/api/axios";
import {
  LOGIN,
  LOGOUT,
  PASSWORD_UPDATE,
  PROFILE_UPDATE,
  REGISTRATION_PATIENT,
  SESSION,
} from "~/config/message";
import { useAlert } from "~/context/AlertContext";

import {
  LoginPayload,
  PatientRegisterPayload,
  UpdatePasswordPayload,
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
      const { showAlert } = useAlert();
      if (isAxiosError(error) && error.response?.status === 401) {
        showAlert(SESSION.expired, "error");
        return null; // unauthenticated is not an error state
      }
      showAlert(SESSION.error, "error");
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
  const { showAlert } = useAlert();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post("/auth/login", payload);
      return data;
    },
    onSuccess: async () => {
      localStorage.setItem("talktherapy_session", "true");
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      showAlert(LOGIN.success, "success");
      navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Login failed:", error.response?.data);
      }
      showAlert(LOGIN.error, "error");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: async () => {
      localStorage.removeItem("talktherapy_session");
      queryClient.removeQueries({ queryKey: ["session"] });
      showAlert(LOGOUT.success, "success");
      navigate({ to: "/login" });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Logout failed:", error.response?.data);
      }
      showAlert(LOGOUT.error, "error");
    },
  });
};

export const useRegisterPatient = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

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
      showAlert(REGISTRATION_PATIENT.success, "success");
      router.navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Registration failed:", error.response?.data);
      }
      showAlert(REGISTRATION_PATIENT.error, "error");
    },
  });
};

export const useEditProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  return useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const { data } = await api.put("/auth/profile/update", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      showAlert(PROFILE_UPDATE.success, "success");
      navigate({ to: "/profile" });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Profile update failed:", error.response?.data);
      }
      showAlert(PROFILE_UPDATE.error, "error");
    },
  });
};

export const useEditPassword = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  return useMutation({
    mutationFn: async (payload: UpdatePasswordPayload) => {
      const { data } = await api.put("/auth/profile/password", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      showAlert(PASSWORD_UPDATE.success, "success");
      navigate({ to: "/profile" });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Password update failed:", error.response?.data);
      }
      showAlert(PASSWORD_UPDATE.error, "error");
    },
  });
};
