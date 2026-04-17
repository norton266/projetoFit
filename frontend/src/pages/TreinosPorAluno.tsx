import { useMemo, useState } from "react"
import { Navigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../store/auth.store"
import { listMeusAlunos, type Aluno } from "../services/alunos"
import { listTreinosDoAluno, type Treino } from "../services/treinos"
import { useNavigate } from "react-router-dom"

function alunoLabel(a: Aluno) {
  const first = (a.first_name || "").trim()
  const last = (a.last_name || "").trim()
  const full = `${first}${first && last ? " " : ""}${last}`.trim()
  return full || a.username
}

export default function TreinosPorAluno() {
  const user = useAuthStore((s) => s.user)
  const isProfessor = user?.role === "PROFESSOR"
  const navigate = useNavigate()

  const [alunoId, setAlunoId] = useState<number | "">("")

  if (!user) return <div className="p-6">Carregando...</div>
  if (!isProfessor) return <Navigate to="/app/dashboard" replace />

  const alunosQuery = useQuery({
    queryKey: ["meus-alunos"],
    queryFn: listMeusAlunos,
  })

  const treinosQuery = useQuery({
    queryKey: ["treinos-do-aluno", alunoId],
    queryFn: () => listTreinosDoAluno(Number(alunoId)),
    enabled: alunoId !== "",
  })

  const header = useMemo(() => {
    const a = (alunosQuery.data ?? []).find((x) => x.id === alunoId)
    return a ? alunoLabel(a) : ""
  }, [alunosQuery.data, alunoId])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Treinos atribuídos por aluno</h1>
        <p className="text-sm text-gray-600">
          Selecione um aluno para ver os treinos atribuídos.
        </p>
      </div>

      {/* Filtro */}
      <div className="bg-white border rounded-2xl p-4 mb-6">
        <label className="text-sm font-medium text-gray-700">
          Selecionar aluno
        </label>

        <div className="mt-2 flex gap-3 items-center">
          <select
            className="w-full max-w-md rounded-lg border px-3 py-2 text-sm bg-white"
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value ? Number(e.target.value) : "")}
            disabled={alunosQuery.isLoading}
          >
            <option value="">Selecione...</option>
            {(alunosQuery.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {alunoLabel(a)} ({a.username})
              </option>
            ))}
          </select>

          {alunosQuery.isLoading && (
            <span className="text-sm text-gray-600">Carregando...</span>
          )}
        </div>

        {alunosQuery.isError && (
          <div className="mt-3 text-sm text-red-700">
            Não foi possível carregar seus alunos.
          </div>
        )}
      </div>

      {/* Lista */}
      {alunoId === "" ? (
        <div className="bg-white border rounded-2xl p-6 text-gray-600">
          Selecione um aluno para visualizar os treinos.
        </div>
      ) : treinosQuery.isLoading ? (
        <div className="bg-white border rounded-2xl p-6">Carregando treinos...</div>
      ) : treinosQuery.isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          Não foi possível carregar os treinos deste aluno.
        </div>
      ) : (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="font-semibold text-gray-900">
              {header ? `Aluno: ${header}` : "Treinos"}
            </div>
            <div className="text-sm text-gray-600">
              {(treinosQuery.data ?? []).length} treino(s) atribuído(s)
            </div>
          </div>

          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3">Título</th>
                <th className="text-left p-3">Descrição</th>
                <th className="text-left p-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {(treinosQuery.data ?? []).length === 0 ? (
                <tr>
                  <td className="p-3 text-gray-600" colSpan={3}>
                    Nenhum treino atribuído para este aluno.
                  </td>
                </tr>
              ) : (
                (treinosQuery.data ?? []).map((t: Treino) => (
                  <tr key={t.id} className="border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/app/treinos/${t.id}`)}>
                    <td className="p-3 font-medium">{t.titulo}</td>
                    <td className="p-3 text-gray-700">
                      {t.descricao?.trim() ? t.descricao : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(t.criado_em).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
