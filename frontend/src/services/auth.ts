import { api } from "./api"

export type Me = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: "PROFESSOR" | "ALUNO" | null
}

export async function getMe(): Promise<Me> {
  const { data } = await api.get("/api/auth/me/")
  return data
}
