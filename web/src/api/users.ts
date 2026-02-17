import { useNavigate } from "@tanstack/react-router";
import { useMutation, queryOptions } from "@tanstack/react-query";
import { api } from "~/api/axios";
import {
  ClinicianRegisterPayload,
  AdminRegisterPayload,
} from "~/models/user/credentials";
export const fetchUsers = async ({
  access,
  account_status,
  account_role,
  page,
  perPage,
}: {
  access: string;
  account_status?: string[];
  account_role?: string[];
  page?: number;
  perPage?: number;
}) => {
  const { data } = await api().get(`/list/users/${access}`, {
    params: {
      account_status,
      account_role,
      page,
      per_page: perPage,
    },
  });

  return data;
};

export const fetchUserDetails = async (userId: string) => {
  const { data } = await api().get(`/users/${userId}`);
  return data;
};

export const addClinician = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload: ClinicianRegisterPayload) => {
      const { data } = await api().post(`/auth/register/clinician`, payload);
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
      const { data } = await api().post(`/auth/register/admin`, payload);
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
