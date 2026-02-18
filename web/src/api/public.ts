import { queryOptions } from "@tanstack/react-query";
import { api } from "./axios";

export const useGetPublicDiagnoses = queryOptions({
  queryKey: ["public-diagnoses"],
  queryFn: async () => {
    const { data } = await api.get("/public/diagnoses");
    return data;
  },
});
