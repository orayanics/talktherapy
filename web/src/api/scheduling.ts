import {
  useMutation,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { api } from "~/api/axios";

import { CreateAvailabilityPayload } from "~/models/schedule";

// query options
export const availabilityRulesQuery = () =>
  queryOptions({
    queryKey: ["availability"],
    queryFn: async () => {
      const { data } = await api.get(`/scheduling/availability`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

// mutations
export const useCreateSchedule = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAvailabilityPayload) => {
      const { data } = await api.post("/scheduling/availability", payload);
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      navigate({ to: "/schedules" });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Failed to create:", error.response?.data);
      }
    },
  });
};
