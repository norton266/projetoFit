import { useDashboardSummary } from "../../hooks/useDashboardSummary"
import { useMeusTreinos } from "../../hooks/useMeusTreinos"
import { useIniciarTreino } from "../../hooks/useIniciarTreino"
import { useNavigate } from "react-router-dom"


function StatCard({
  title,
  value,
  loading,
}: {
  title: string
  value?: number
  loading?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {loading ? "—" : value ?? 0}
      </p>
    </div>
  )
}

export default function DashboardAluno() {
  const { data, isLoading } = useDashboardSummary()
  const { data: treinos, isLoading: loadingTreinos } = useMeusTreinos()
  const { mutate: iniciarTreino, isPending } = useIniciarTreino()
  const navigate = useNavigate()

  const handleStart = (treinoId: number) => {
    iniciarTreino(treinoId, {
      onSuccess: (data) => {
        // redirecionar
        navigate(`/app/sessao/${data.sessao_id}`)
      }
  })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Meu Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Acompanhe seu progresso e seus treinos
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Treinos realizados"
          value={data?.treinos}
          loading={isLoading}
        />
        <StatCard
          title="Sessões concluídas"
          value={data?.sessoes}
          loading={isLoading}
        />
      </div>

      {/* Lista de treinos */}
      <div className="bg-white rounded-2xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-3">
          Seus treinos
        </h2>

        {loadingTreinos && (
          <p className="text-sm text-gray-500">Carregando treinos...</p>
        )}

        {!loadingTreinos && treinos?.length === 0 && (
          <p className="text-sm text-gray-500">
            Nenhum treino disponível ainda.
          </p>
        )}

        <div className="space-y-2">
          {treinos?.map((treino) => (
            <div
              key={treino.id}
              className="border rounded-lg p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{treino.titulo}</p>
                <p className="text-xs text-gray-500">
                  {treino.descricao}
                </p>
              </div>

              <button
                onClick={() => handleStart(treino.id)}
                disabled={isPending}
                className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm hover:bg-black disabled:opacity-50"
              >
                {isPending ? "..." : "Iniciar"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}