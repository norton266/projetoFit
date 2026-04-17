import { useMemo, useState } from "react"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../services/api"

const registerSchema = z
  .object({
    role: z.enum(["ALUNO", "PROFESSOR"]).refine(
        (val) => !!val,
        "Selecione o tipo"
    ),

    username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    first_name: z.string().min(1, "Informe seu primeiro nome"),
    last_name: z.string().min(1, "Informe seu sobrenome"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    password2: z.string().min(6, "Confirme a senha"),
  })
  .refine((data) => data.password === data.password2, {
    message: "As senhas não coincidem",
    path: ["password2"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState<RegisterForm>({
    role: "ALUNO",
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  })

  const [fieldError, setFieldError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fullNamePreview = useMemo(() => {
    const n = `${form.first_name}`.trim()
    const s = `${form.last_name}`.trim()
    return `${n}${n && s ? " " : ""}${s}`.trim()
  }, [form.first_name, form.last_name])

  function set<K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function normalizeApiError(err: any) {
    // DRF costuma retornar {field: ["msg"]} ou {detail: "..."}
    const data = err?.response?.data
    if (!data) return "Falha ao cadastrar. Tente novamente."

    if (typeof data?.detail === "string") return data.detail

    if (typeof data === "object") {
      const firstKey = Object.keys(data)[0]
      const val = data[firstKey]
      if (Array.isArray(val) && val[0]) return `${firstKey}: ${val[0]}`
      if (typeof val === "string") return `${firstKey}: ${val}`
    }

    return "Falha ao cadastrar. Verifique os dados e tente novamente."
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFieldError(null)
    setApiError(null)
    setSuccessMsg(null)

    const parsed = registerSchema.safeParse(form)
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Dados inválidos")
      return
    }

    setIsLoading(true)
    try {
      // ✅ ajuste o endpoint conforme seu backend
      // Sugestão: POST /api/auth/register/
      await api.post("/api/auth/register/", {
        role: parsed.data.role,
        username: parsed.data.username,
        email: parsed.data.email,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        password: parsed.data.password,
      })

      setSuccessMsg(
        "Cadastro enviado! Aguarde a aprovação do professor para acessar o sistema."
      )

      // opcional: redireciona após alguns segundos ou botão manual
      // navigate("/login")
    } catch (err: any) {
      setApiError(normalizeApiError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Criar conta
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Preencha os dados para solicitar acesso
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white border shadow-sm rounded-2xl p-6"
        >
          <div className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tipo de usuário
              </label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20 bg-white"
                value={form.role}
                onChange={(e) => set("role", e.target.value as RegisterForm["role"])}
              >
                <option value="ALUNO">Aluno</option>
                <option value="PROFESSOR">Professor</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Professores poderão aprovar cadastros pendentes.
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
                placeholder="ex: norton"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                autoComplete="username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">E-mail</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
                placeholder="voce@email.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Nome */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Nome</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
                  placeholder="Norton"
                  value={form.first_name}
                  onChange={(e) => set("first_name", e.target.value)}
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Sobrenome</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
                  placeholder="Wolff"
                  value={form.last_name}
                  onChange={(e) => set("last_name", e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {fullNamePreview && (
              <div className="text-xs text-gray-500">
                Nome exibido: <span className="font-medium">{fullNamePreview}</span>
              </div>
            )}

            {/* Senhas */}
            <div>
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Confirmar senha
              </label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20"
                placeholder="••••••••"
                type="password"
                value={form.password2}
                onChange={(e) => set("password2", e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {(fieldError || apiError) && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {fieldError || apiError}
              </div>
            )}

            {successMsg && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gray-900 text-white py-2.5 text-sm font-semibold hover:bg-black disabled:opacity-60 transition"
            >
              {isLoading ? "Enviando..." : "Solicitar cadastro"}
            </button>

            <div className="flex items-center justify-between pt-1">
              <Link to="/login" className="text-sm text-gray-600 hover:underline">
                Voltar para login
              </Link>

              {/* opcional: após sucesso */}
              {successMsg && (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm font-medium text-gray-900 hover:underline"
                >
                  Ir para login
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center">
              Ao solicitar cadastro, seu acesso pode ficar <b>pendente</b> até aprovação.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
