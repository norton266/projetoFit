import { api } from "./api"

export type DashboardSummary = {
  treinos: number
  alunos: number
  alunos_pendentes: number
  sessoes: number
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get("/api/dashboard/summary/")
  return data
}
