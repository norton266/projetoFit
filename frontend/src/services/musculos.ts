import { api } from "./api"

export type Musculo = {
  id: number
  nome: string
}

export async function listMusculos(): Promise<Musculo[]> {
  const { data } = await api.get("/api/musculos/")
  return data
}

export async function createMusculo(payload: { nome: string }) {
  const { data } = await api.post("/api/musculos/", payload)
  return data
}