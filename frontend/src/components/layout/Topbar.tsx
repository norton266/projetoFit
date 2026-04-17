import { useAuthStore } from "../../store/auth.store"
import { useNavigate } from "react-router-dom"

export default function Topbar() {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <span className="font-medium">
        Bem-vindo{user?.first_name ? `, ${user.first_name}` : ""}
      </span>

      <div className="flex items-center gap-4">
        

        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
