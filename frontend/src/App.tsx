import { useEffect } from "react"
import { useAuthStore } from "./store/auth.store"

export default function App() {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  return (
    // suas rotas/layout
    <></>
  )
}
