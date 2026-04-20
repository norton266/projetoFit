import { useQuery } from "@tanstack/react-query"
import { getSessao } from "../services/sessoes"

export function useSessao(id?: string) {
  return useQuery({
    queryKey: ["sessao", id],
    queryFn: () => getSessao(Number(id)),
    enabled: !!id,
  })
}