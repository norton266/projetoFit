import { useDashboardSummary } from "../../hooks/useDashboardSummary"

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

      {/* Próximo treino */}
      <div className="bg-white rounded-2xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-2">
          Próximo treino
        </h2>
        <p className="text-sm text-gray-600">
          Em breve você verá aqui o próximo treino programado.
        </p>

        <button className="mt-4 inline-flex items-center rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black transition">
          Iniciar treino
        </button>
      </div>
    </div>
  )
}
