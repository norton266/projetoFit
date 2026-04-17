import { api } from "./api"

export type Aluno = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
}

export async function listMeusAlunos(): Promise<Aluno[]> {
  const { data } = await api.get("/api/professor/meus-alunos/")
  return data
}
