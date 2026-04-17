import { create } from "zustand"
import { api } from "../services/api"
import { getMe, type Me } from "../services/auth"

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: Me | null

  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hydrateFromStorage: () => Promise<void>
  setUser: (user: Me | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: false,
  error: null,
  user: null,

  setUser: (user) => set({ user }),

  hydrateFromStorage: async () => {
    const access = localStorage.getItem("access_token")
    const refresh = localStorage.getItem("refresh_token")

    set({
      accessToken: access,
      refreshToken: refresh,
      isAuthenticated: !!access,
      error: null,
    })

    if (!access) {
      set({ user: null })
      return
    }

    if (get().user) return

    try {
      const me = await getMe()
      set({ user: me })
    } catch (err: any) {
      const status = err?.response?.status

      if (status === 401) {
        get().logout()
      } else {
        console.error("Erro inesperado no hydrate:", err)
      }
    }
  },

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null })

    try {
      const { data } = await api.post("/api/auth/login/", { username, password })

      const access = data?.access
      const refresh = data?.refresh
      if (!access || !refresh) throw new Error("access/refresh ausentes")

      localStorage.setItem("access_token", access)
      localStorage.setItem("refresh_token", refresh)

      // Atualiza estado de auth antes de buscar o /me (caso seu api interceptor use token do state)
      set({
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
        isLoading: true,
        error: null,
      })

      const me = await getMe()

      set({
        user: me,
        isLoading: false,
        error: null,
      })
    } catch (err: any) {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")

      set({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: err?.response?.data?.detail || "Falha no login.",
      })

      throw err
    }
  },

  logout: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")

    set({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null,
    })
  },
}))
