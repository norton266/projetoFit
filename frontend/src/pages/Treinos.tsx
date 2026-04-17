import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../store/auth.store"
import { listTreinos, atribuirTreino, type Treino } from "../services/treinos"
import { listMeusAlunos, type Aluno } from "../services/alunos"

function displayName(u: Aluno) {
  const first = (u.first_name || "").trim()
  const last = (u.last_name || "").trim()
  const full = `${first}${first && last ? " " : ""}${last}`.trim()
  return full || u.username
}

export default function Treinos() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedTreino, setSelectedTreino] = useState<Treino | null>(null)
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | "">("")

  const isProfessor = user?.role === "PROFESSOR"

  const treinosQuery = useQuery({
    queryKey: ["treinos"],
    queryFn: listTreinos,
  })

  const alunosQuery = useQuery({
    queryKey: ["meus-alunos"],
    queryFn: listMeusAlunos,
    enabled: isProfessor, // só carrega se professor
  })

  const templates = useMemo(() => {
    const all = treinosQuery.data ?? []
    return isProfessor ? all.filter((t) => t.tipo === "TEMPLATE") : all
  }, [treinosQuery.data, isProfessor])

  const assignMutation = useMutation({
    mutationFn: ({ treinoId, alunoId }: { treinoId: number; alunoId: number }) =>
      atribuirTreino(treinoId, alunoId),
    onSuccess: () => {
      setAssignOpen(false)
      setSelectedTreino(null)
      setSelectedAlunoId("")
      qc.invalidateQueries({ queryKey: ["treinos"] })
    },
  })

  function openAssign(t: Treino) {
    setSelectedTreino(t)
    setSelectedAlunoId("")
    setAssignOpen(true)
  }

  function confirmAssign() {
    if (!selectedTreino) return
    if (!selectedAlunoId) return
    assignMutation.mutate({ treinoId: selectedTreino.id, alunoId: Number(selectedAlunoId) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Treinos</h1>
        {isProfessor && (
          <span className="text-sm text-gray-600">
            Dica: atribua treinos do tipo <b>TEMPLATE</b>
          </span>
        )}
      </div>

      {treinosQuery.isLoading && (
        <div className="bg-white rounded shadow p-4">Carregando...</div>
      )}

      {treinosQuery.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4">
          Não foi possível carregar treinos.
        </div>
      )}

      {!treinosQuery.isLoading && !treinosQuery.isError && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-3">Título</th>
                <th className="text-left p-3">Descrição</th>
                <th className="text-left p-3">Tipo</th>
                {isProfessor && <th className="text-right p-3">Ações</th>}
              </tr>
            </thead>

            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td className="p-3 text-gray-600" colSpan={isProfessor ? 4 : 3}>
                    {isProfessor
                      ? "Você ainda não tem treinos TEMPLATE."
                      : "Você ainda não tem treinos atribuídos."}
                  </td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-3 font-medium">{t.titulo}</td>
                    <td className="p-3 text-gray-700">
                      {t.descricao?.trim() ? t.descricao : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold border">
                        {t.tipo === "ALUNO" ? "Atribuído" : "Template"}
                      </span>
                    </td>

                    {isProfessor && (
                      <td className="p-3 text-right">
                        {t.tipo === "TEMPLATE" && (
                          <button
                            onClick={() => openAssign(t)}
                            className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black"
                          >
                            Atribuir
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal simples */}
      {assignOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Atribuir treino</h2>
                <p className="text-sm text-gray-600">
                  Treino: <b>{selectedTreino?.titulo}</b>
                </p>
              </div>

              <button
                onClick={() => setAssignOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Selecione o aluno
              </label>

              <select
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={selectedAlunoId}
                onChange={(e) => setSelectedAlunoId(e.target.value ? Number(e.target.value) : "")}
                disabled={alunosQuery.isLoading || alunosQuery.isError}
              >
                <option value="">Selecione...</option>
                {(alunosQuery.data ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {displayName(a)} ({a.username})
                  </option>
                ))}
              </select>

              {alunosQuery.isLoading && (
                <div className="text-sm text-gray-600">Carregando alunos...</div>
              )}

              {alunosQuery.isError && (
                <div className="text-sm text-red-700">
                  Não foi possível carregar seus alunos.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setAssignOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-sm font-semibold hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  onClick={confirmAssign}
                  disabled={!selectedAlunoId || assignMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-60"
                >
                  {assignMutation.isPending ? "Atribuindo..." : "Confirmar"}
                </button>
              </div>

              {assignMutation.isError && (
                <div className="text-sm text-red-700">
                  Falha ao atribuir. Verifique se o aluno pertence a você e se o treino é TEMPLATE.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
