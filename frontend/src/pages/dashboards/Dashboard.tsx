import { useAuthStore } from "../../store/auth.store"
import DashboardProfessor from "../dashboards/DashboardProfessor"
import DashboardAluno from "../dashboards/DashboardAluno"

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  console.log("DASHBOARD user:", user, "isAuthenticated:", isAuthenticated)

  if (!isAuthenticated) {
    return <div className="text-sm text-gray-600">Não autenticado.</div>
  }

  if (!user) {
    return <div className="text-sm text-gray-600">Carregando usuário…</div>
  }

  if (user.role === "PROFESSOR") return <DashboardProfessor />
  if (user.role === "ALUNO") return <DashboardAluno />

  return (
    <div className="text-sm text-red-600">
      Role desconhecida: {String((user as any).role)}
    </div>
  )
}