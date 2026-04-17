import { useDashboardSummary } from "../../hooks/useDashboardSummary"
import { useNavigate } from "react-router-dom"

function StatCard({
  title,
  value,
  subtitle,
  loading,
}: {
  title: string
  value?: number
  subtitle?: string
  loading?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {loading ? "—" : value ?? 0}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  )
}

export default function DashboardProfessor() {
  const { data, isLoading } = useDashboardSummary()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard do Professor
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Visão geral dos seus treinos e alunos
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Treinos criados"
          value={data?.treinos}
          subtitle="Total cadastrados"
          loading={isLoading}
        />
        <StatCard
          title="Alunos ativos"
          value={data?.alunos}
          subtitle="Com sessões registradas"
          loading={isLoading}
        />
        <StatCard
          title="Sessões realizadas"
          value={data?.sessoes}
          subtitle="Execuções de treinos"
          loading={isLoading}
        />
      </div>

      {/* Ações rápidas */}
      <div className="bg-white rounded-2xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-3">
          Ações rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <button
            type="button"
            onClick={() => navigate("/professor/treinos/novo")}
            className="text-left rounded-lg border p-3 hover:bg-gray-50"
          >
            ➕ Criar novo treino
            <p className="text-xs text-gray-500 mt-1">
              Criar treino para aluno ou template
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/professor/templates")}
            className="text-left rounded-lg border p-3 hover:bg-gray-50"
          >
            🧩 Templates
            <p className="text-xs text-gray-500 mt-1">
              Gerenciar e atribuir templates
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/professor/execucoes")}
            className="text-left rounded-lg border p-3 hover:bg-gray-50"
          >
            📊 Ver execuções
          </button>

          <button
            type="button"
            onClick={() => navigate("/professor/exercicios/novo")}
            className="text-left rounded-lg border p-3 hover:bg-gray-50"
          >
            💪 Criar exercício
            <p className="text-xs text-gray-500 mt-1">
              Cadastrar novo exercício
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/professor/musculos/novo")}
            className="text-left rounded-lg border p-3 hover:bg-gray-50"
          >
            💪 Criar músculo
            <p className="text-xs text-gray-500 mt-1">
              Cadastrar novos músculos
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
