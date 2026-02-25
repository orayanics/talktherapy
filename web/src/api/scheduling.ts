import {
  useMutation,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { format } from "date-fns/format";
import { api } from "~/api/axios";

import { CreateAvailabilityPayload } from "~/models/schedule";

// query options
export const availabilityRulesQuery = (date?: Date) =>
  queryOptions({
    queryKey: ["availability", date],
    queryFn: async () => {
      const params = date ? { from: format(date, "yyyy-MM-dd") } : {};
      const { data } = await api.get(`/scheduling/availability`, { params });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

export const availabilityByIdQuery = (ruleId: string) =>
  queryOptions({
    queryKey: ["availability", ruleId],
    queryFn: async () => {
      const { data } = await api.get(`/scheduling/availability/${ruleId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

export const appointmentsQuery = (date?: Date) =>
  queryOptions({
    queryKey: ["appointments", date],
    queryFn: async () => {
      const params = date ? { from: format(date, "yyyy-MM-dd") } : {};
      const { data } = await api.get(`/scheduling/slots/available`, {
        params,
      });
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
