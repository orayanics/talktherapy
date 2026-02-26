import {
  useMutation,
  queryOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { format } from "date-fns/format";
import { api } from "~/api/axios";
import { SCHEDULE } from "~/config/message";
import { useAlert } from "~/context/AlertContext";

import {
  AvailabilityRulesParams,
  CreateAvailabilityPayload,
  PatientAppointmentsQueryParams,
} from "~/models/schedule";

// query options
export const availabilityRulesQuery = (params: AvailabilityRulesParams) =>
  queryOptions({
    queryKey: ["availability", "list", params],
    queryFn: async () => {
      const apiParams = {
        ...(params.date && { from: format(params.date, "yyyy-MM-dd") }),
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
      };
      const { data } = await api.get(`/scheduling/availability`, {
        params: apiParams,
      });
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

export const appointmentsQuery = (params: PatientAppointmentsQueryParams) =>
  queryOptions({
    queryKey: ["appointments", params],
    queryFn: async () => {
      const apiParams = {
        ...(params.date && { from: format(params.date, "yyyy-MM-dd") }),
        ...(params.diagnosis && { diagnosis: params.diagnosis }),
        page: params.page ?? 1,
        per_page: params.perPage ?? 10,
      };
      const { data } = await api.get(`/scheduling/slots/available`, {
        params: apiParams,
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
  const { showAlert } = useAlert();

  return useMutation({
    mutationFn: async (payload: CreateAvailabilityPayload) => {
      const { data } = await api.post("/scheduling/availability", payload);
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      showAlert(SCHEDULE.create.success, "success");
      navigate({ to: "/schedules" });
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        console.error("Failed to create:", error.response?.data);
      }
      showAlert(SCHEDULE.create.error, "error");
    },
  });
};
