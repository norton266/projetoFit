import { useState } from "react"
import { z } from "zod"
import { useAuthStore } from "../store/auth.store"
import { useNavigate, Link } from "react-router-dom"

const loginSchema = z.object({
  username: z.string().min(1, "Informe o usuário"),
  password: z.string().min(1, "Informe a senha"),
})

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldError(null)

    const parsed = loginSchema.safeParse({ username, password })
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Dados inválidos")
      return
    }

    try {
      await login(parsed.data.username, parsed.data.password)
      navigate("/app/dashboard")
    } catch {
      // erro já está no store
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Projeto Fit
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Entre para acessar seu painel
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white border shadow-sm rounded-2xl p-6"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Usuário
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
                placeholder="teste"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {(fieldError || error) && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {fieldError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gray-900 text-white py-2.5 text-sm font-semibold hover:bg-black disabled:opacity-60 transition"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>

            {/* ✅ Links abaixo do botão */}
            <div className="flex items-center justify-between pt-1">
              <Link
                to="/register"
                className="text-sm font-medium text-gray-900 hover:underline"
              >
                Criar conta
              </Link>

              {/* opcional */}
              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Dica: use seu <b>username</b> (ex: <b>teste</b>).
            </p>
          </div>
        </form>

        {/* ✅ CTA extra fora do card (opcional, fica bem bonito) */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Não tem conta?{" "}
          <Link to="/register" className="font-semibold text-gray-900 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
