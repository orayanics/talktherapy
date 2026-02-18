import { useMutation, queryOptions } from "@tanstack/react-query";
import { api } from "~/api/axios";

export const fetchDashboardData = async () => {
  const { data } = await api.get("/auth/users/count");
  return data;
};
