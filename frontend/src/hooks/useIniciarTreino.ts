import { useMutation } from "@tanstack/react-query"
import { iniciarTreino } from "../services/treinos"

export function useIniciarTreino() {
  return useMutation({
    mutationFn: (treinoId: number) => iniciarTreino(treinoId),
  })
}