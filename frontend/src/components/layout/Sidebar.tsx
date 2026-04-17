import { NavLink } from "react-router-dom"
import { useAuthStore } from "../../store/auth.store"

export default function Sidebar() {
  const user = useAuthStore((s) => s.user)

  const baseClass =
    "rounded px-3 py-2 text-sm font-medium transition-colors"

  const activeClass =
    "bg-gray-900 text-white"

  const inactiveClass =
    "text-gray-700 hover:bg-gray-100"

  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4 font-bold text-xl">Projeto Fit</div>

      <nav className="flex flex-col gap-1 px-2">
        <NavLink
          to="/app/dashboard"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/app/treinos"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Treinos
        </NavLink>

        {/* ✅ SOMENTE PROFESSOR */}
        {user?.role === "PROFESSOR" && (
          <NavLink
            to="/app/cadastros-pendentes"
            className={({ isActive }) =>
              `${baseClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            Cadastros pendentes
          </NavLink>
          
        )}
        {user?.role === "PROFESSOR" && (
          <NavLink
            to="/app/treinos-por-aluno"
            className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
          >
            Treinos por aluno
          </NavLink>
        )}
      </nav>
    </aside>
  )
}
