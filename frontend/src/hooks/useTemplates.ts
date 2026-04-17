import { useEffect, useState } from "react"
import { fetchTemplates, fetchAlunos } from "../services/templates"
import axios from "axios"

export interface Template {
  id: number
  titulo: string
  descricao?: string
}

export interface Aluno {
  id: number
  username: string
  first_name?: string
  last_name?: string
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [t, a] = await Promise.all([
          fetchTemplates(),
          fetchAlunos(),
        ])

        if (!isMounted) return

        setTemplates(t)
        setAlunos(a)

      } catch (e: unknown) {
        if (!isMounted) return

        if (axios.isAxiosError(e)) {
          setError(
            e.response?.data?.detail || "Erro ao carregar dados"
          )
        } else {
          setError("Erro inesperado")
        }

      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return { templates, alunos, loading, error }
}