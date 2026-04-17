// src/components/AuthHydrator.tsx
import { useEffect } from "react"
import { useAuthStore } from "../store/auth.store"

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  return <>{children}</>
}
