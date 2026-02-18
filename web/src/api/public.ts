import { queryOptions } from "@tanstack/react-query";
import { api } from "./axios";

export const fetchPublicDiagnoses = async () => {
  const { data } = await api.get("/public/diagnoses");
  return data;
};

export const useGetPublicDiagnoses = queryOptions({
  queryKey: ["public-diagnoses"],
  queryFn: () => fetchPublicDiagnoses(),
});
