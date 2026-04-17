import { api } from "./api"

export async function fetchTemplates() {
  const res = await api.get("/api/treinos/?tipo=TEMPLATE")
  return res.data ?? []
}

export async function fetchAlunos() {
  const res = await api.get("/api/professor/meus-alunos/")
  return res.data ?? []
}

export async function atribuirTemplate(templateId: number, alunoId: number) {
  return api.post(`/api/treinos/${templateId}/atribuir/`, {
    aluno: alunoId,
  })
}