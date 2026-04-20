import { api } from "./api"

export async function getSessao(id: number) {
  const { data } = await api.get(`/api/treinos/sessao/${id}/`)
  return data
}

export async function finalizarSessao(id: number) {
  const { data } = await api.post(`/api/treinos/sessao/${id}/finalizar/`)
  return data
}