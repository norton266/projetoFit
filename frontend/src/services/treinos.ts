import { api } from "./api"

export type Treino = {
  id: number
  tipo: "TEMPLATE" | "ALUNO"
  titulo: string
  descricao: string
  criado_em: string
  atualizado_em: string
  aluno: number | null
  professor: number
}

export async function listTreinos(): Promise<Treino[]> {
  const { data } = await api.get("/api/treinos/")
  return data
}

export async function atribuirTreino(treinoId: number, alunoId: number) {
  const { data } = await api.post(`/api/treinos/${treinoId}/atribuir/`, { aluno: alunoId })
  return data
}

export async function listTreinosDoAluno(alunoId: number): Promise<Treino[]> {
  const { data } = await api.get(`/api/treinos/aluno/${alunoId}/`)
  return data
}

export async function getTreino(id: number): Promise<Treino> {
  const { data } = await api.get(`/api/treinos/${id}/`)
  return data
}

export type Exercicio = {
  id: number
  nome: string
  series: number
  repeticoes: number
}

export async function listExerciciosDoTreino(treinoId: number): Promise<Exercicio[]> {
  const { data } = await api.get(`/api/treinos/${treinoId}/exercicios/`)
  return data
}