import { api } from "./api"

export type PendingUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: "ALUNO" | "PROFESSOR" | "ADMIN"
  status: "PENDING" | "APPROVED" | "REJECTED"
  date_joined: string
}

export async function listPendingUsers(): Promise<PendingUser[]> {
  const { data } = await api.get("/api/auth/pending-users/")
  return data
}

export async function reviewUser(userId: number, action: "approve" | "reject") {
  const { data } = await api.post(`/api/auth/review-user/${userId}/`, { action })
  return data
}
