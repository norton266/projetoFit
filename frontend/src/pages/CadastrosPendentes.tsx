import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/auth.store"
import { listPendingUsers, reviewUser, type PendingUser } from "../services/pendingUsers"

function formatName(u: PendingUser) {
  const first = (u.first_name || "").trim()
  const last = (u.last_name || "").trim()
  const full = `${first}${first && last ? " " : ""}${last}`.trim()
  return full || u.username
}

export default function CadastrosPendentes() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)

  // ✅ bloqueia se não for professor
  if (!user) return <div className="p-6">Carregando...</div>
  if (user.role !== "PROFESSOR") return <Navigate to="/app/dashboard" replace />

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pending-users"],
    queryFn: listPendingUsers,
  })

  const pendingOnly = useMemo(() => {
    return (data ?? []).filter((u) => u.status === "PENDING")
  }, [data])

  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "approve" | "reject" }) =>
      reviewUser(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-users"] }),
  })

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Cadastros pendentes</h1>
        <p className="text-sm text-gray-600">
          Aprove ou recuse os pedidos de acesso.
        </p>
      </div>

      {isLoading && (
        <div className="rounded-xl border bg-white p-4">Carregando...</div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Não foi possível carregar os cadastros pendentes.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {pendingOnly.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-gray-600">
              Nenhum cadastro pendente.
            </div>
          ) : (
            pendingOnly.map((u) => (
              <div
                key={u.id}
                className="rounded-2xl border bg-white p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {formatName(u)}
                  </div>
                  <div className="text-sm text-gray-600 truncate">{u.email}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Username: <b>{u.username}</b> • Tipo: <b>{u.role}</b>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => mutation.mutate({ id: u.id, action: "approve" })}
                    disabled={mutation.isPending}
                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => mutation.mutate({ id: u.id, action: "reject" })}
                    disabled={mutation.isPending}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
