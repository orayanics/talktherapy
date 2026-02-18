import { useNavigate } from "@tanstack/react-router";
import { useMutation, queryOptions } from "@tanstack/react-query";
import { api } from "~/api/axios";
import {
  ClinicianRegisterPayload,
  AdminRegisterPayload,
} from "~/models/user/credentials";

type UsersParams = {
  search?: string;
  account_status?: string[];
  account_role?: string[];
  page?: number;
  perPage?: number;
};

const fetchUsers = async (params: UsersParams) => {
  const { data } = await api.get("/auth/users", {
    params: {
      search: params.search || undefined,
      account_status: params.account_status,
      account_role: params.account_role,
      page: params.page ?? 1,
      per_page: params.perPage ?? 10,
    },
  });
  return data;
};

export const usersQueryOptions = (params: UsersParams) =>
  queryOptions({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
    placeholderData: (prev) => prev, // keeps stale data visible during page transitions
  });

export const fetchUserDetails = async (userId: string) => {
  const { data } = await api.get(`/users/${userId}`);
  return data;
};

export const addClinician = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload: ClinicianRegisterPayload) => {
      const { data } = await api.post(`/auth/register/clinician`, payload);
      return data;
    },
    onSuccess: () => {
      navigate({
        to: "/users",
        search: {
          page: 1,
          perPage: 10,
          role: [],
          status: [],
        },
      });
    },
  });
};

export const addAdmin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload: AdminRegisterPayload) => {
      const { data } = await api.post(`/auth/register/admin`, payload);
      return data;
    },
    onSuccess: () => {
      navigate({
        to: "/users",
        search: {
          page: 1,
          perPage: 10,
          role: [],
          status: [],
        },
      });
    },
  });
};
