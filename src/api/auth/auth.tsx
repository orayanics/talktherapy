import {
  useMutation,
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { api, apiServer, apiClient } from "~/api/axios";

import { UserCredentialsDTO } from "~/models/user/credentials";

export function useLogin() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (payload: UserCredentialsDTO) => {
      await apiClient.get("/sanctum/csrf-cookie");
      const { data } = await api().post("/login", payload);
      return data;
    },
    onSuccess: () => {
      navigate({ to: "/dashboard" });
    },
  });
}

export const fetchSession = async () => {
  const { data } = await apiClient.get("/me");
  return data;
};

export const useGetSession = queryOptions({
  queryKey: ["session"],
  queryFn: () => fetchSession(),
});
