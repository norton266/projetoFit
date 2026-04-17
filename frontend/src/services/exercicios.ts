import { api } from "./api"

export type Nivel = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO"

export type ExercicioPayload = {
  nome: string
  descricao?: string
  nivel: Nivel
  video_url?: string
  thumbnail_url?: string

  equipamento?: number | null
  musculos_principais?: number[]
  musculos_secundarios?: number[]
}

export async function createExercicio(payload: ExercicioPayload) {
  const { data } = await api.post("/api/exercicios/", payload)
  return data
}

export async function listMusculos() {
  const { data } = await api.get("/api/musculos/")
  return data
}

export async function listEquipamentos() {
  const { data } = await api.get("/api/equipamentos/")
  return data
}