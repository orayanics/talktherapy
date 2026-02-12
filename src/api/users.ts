import { useMutation, queryOptions } from "@tanstack/react-query";
import { api } from "~/api/axios";

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
  const { data } = await api().get(`/users/${access}`, {
    params: {
      account_status,
      account_role,
      page,
      per_page: perPage,
    },
  });

  return data;
};
