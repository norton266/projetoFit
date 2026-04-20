import { useQuery } from "@tanstack/react-query"
import { listTreinos } from "../services/treinos"
import type { Treino } from "../services/treinos"

export function useMeusTreinos() {
  return useQuery<Treino[]>({
    queryKey: ["meus-treinos"],
    queryFn: listTreinos,
  })
}