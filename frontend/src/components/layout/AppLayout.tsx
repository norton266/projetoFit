import { Outlet, Navigate } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import { useAuthStore } from "../../store/auth.store"
import { useEffect } from "react"

export default function AppLayout() {
  const { isAuthenticated, hydrateFromStorage } = useAuthStore()

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
