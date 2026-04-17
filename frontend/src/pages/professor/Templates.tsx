import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../services/api"

type Usuario = {
  id: number
  username: string
  first_name?: string
  last_name?: string
}

type Treino = {
  id: number
  tipo: "TEMPLATE" | "ALUNO"
  titulo: string
  descricao: string
  criado_em: string
  itens?: Array<{
    id: number
    ordem: number
    series: number
    repeticoes: string
    carga: string
    descanso_seg: number
    observacoes: string
    exercicio?: { id: number; nome: string } | string
  }>
}

function formatAluno(a: Usuario) {
  const nome = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim()
  return nome || a.username
}

export default function Templates() {
  const navigate = useNavigate()

  const [alunos, setAlunos] = useState<Usuario[]>([])
  const [alunoId, setAlunoId] = useState<number | "">("")

  const [templates, setTemplates] = useState<Treino[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [alunosRes, treinosRes] = await Promise.all([
        api.get("/api/professor/meus-alunos/"),
        api.get("/api/treinos/?tipo=TEMPLATE"),
      ])

      setAlunos(alunosRes.data ?? [])

      // se o backend ainda não filtra por tipo, filtra no front:
      const list: Treino[] = (treinosRes.data ?? []).filter((t: Treino) => t.tipo === "TEMPLATE")
      setTemplates(list)
    } catch (e) {
      setError("Não foi possível carregar templates/alunos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return templates
    return templates.filter((t) => {
      const a = (t.titulo || "").toLowerCase()
      const b = (t.descricao || "").toLowerCase()
      return a.includes(q) || b.includes(q)
    })
  }, [search, templates])

  async function atribuir(templateId: number) {
    setError(null)

    if (!alunoId) {
      setError("Selecione um aluno para atribuir o template.")
      return
    }

    setBusyId(templateId)
    try {
      await api.post(`/api/treinos/${templateId}/atribuir/`, { aluno: alunoId })

      // UX simples e boa: recarrega list (opcional)
      await load()

      // navegação opcional
      const go = window.confirm("Template atribuído com sucesso! Quer ver os treinos desse aluno agora?")
      if (go) navigate(`/professor/treinos/aluno/${alunoId}`)
    } catch (e: any) {
      const data = e?.response?.data
      const detail =
        data?.detail ||
        (typeof data === "object" ? JSON.stringify(data) : null) ||
        "Erro ao atribuir template."
      setError(detail)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Templates</h1>
          <p style={{ marginTop: 6, color: "#555" }}>
            Selecione um aluno e atribua um treino template (ele será clonado como treino do aluno).
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/professor/treinos/novo")}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" }}
          >
            + Novo template
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#fff2f2", border: "1px solid #ffd0d0" }}>
          <strong>Ops:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ padding: 16, border: "1px solid #e6e6e6", borderRadius: 14, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Selecionar aluno</h3>
          <select
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value ? Number(e.target.value) : "")}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option value="">Selecione...</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {formatAluno(a)}
              </option>
            ))}
          </select>

          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button
              disabled={!alunoId}
              onClick={() => alunoId && navigate(`/professor/treinos/aluno/${alunoId}`)}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: alunoId ? "#fff" : "#f6f6f6",
                cursor: alunoId ? "pointer" : "not-allowed",
              }}
            >
              Ver treinos do aluno
            </button>

            <button
              onClick={() => navigate("/professor/treinos")}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
            >
              Ver todos os treinos
            </button>
          </div>
        </div>

        <div style={{ padding: 16, border: "1px solid #e6e6e6", borderRadius: 14, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Buscar</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Digite parte do título ou descrição..."
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
          <p style={{ marginTop: 10, color: "#666" }}>
            {loading ? "Carregando..." : `${filtrados.length} template(s) encontrado(s).`}
          </p>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {loading ? (
          <div style={{ padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #e6e6e6" }}>
            Carregando templates...
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #e6e6e6" }}>
            Nenhum template encontrado.
          </div>
        ) : (
          filtrados.map((t) => (
            <div key={t.id} style={{ padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #e6e6e6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.titulo}
                  </h3>
                  {t.descricao ? (
                    <p style={{ marginTop: 8, color: "#555" }}>{t.descricao}</p>
                  ) : (
                    <p style={{ marginTop: 8, color: "#888" }}>Sem descrição.</p>
                  )}
                  <p style={{ marginTop: 8, color: "#777", fontSize: 13 }}>
                    ID: {t.id} • Tipo: {t.tipo}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <button
                    onClick={() => navigate(`/professor/treinos/editar/${t.id}`)}
                    style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
                  >
                    Editar
                  </button>

                  <button
                    disabled={!alunoId || busyId === t.id}
                    onClick={() => atribuir(t.id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #111",
                      background: !alunoId ? "#f6f6f6" : "#111",
                      color: !alunoId ? "#999" : "#fff",
                      cursor: !alunoId || busyId === t.id ? "not-allowed" : "pointer",
                    }}
                  >
                    {busyId === t.id ? "Atribuindo..." : "Atribuir"}
                  </button>
                </div>
              </div>

              {Array.isArray(t.itens) && t.itens.length > 0 && (
                <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 12 }}>
                  <strong style={{ fontSize: 13, color: "#444" }}>Exercícios ({t.itens.length})</strong>
                  <ul style={{ marginTop: 8, paddingLeft: 18, color: "#555" }}>
                    {t.itens
                      .slice()
                      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
                      .slice(0, 6)
                      .map((it) => {
                        const nome =
                          typeof it.exercicio === "string"
                            ? it.exercicio
                            : (it.exercicio as any)?.nome || "Exercício"
                        return (
                          <li key={it.id}>
                            {nome} — {it.series}x {it.repeticoes} • descanso {it.descanso_seg}s
                            {it.carga ? ` • carga: ${it.carga}` : ""}
                          </li>
                        )
                      })}
                    {t.itens.length > 6 && <li>… e mais {t.itens.length - 6} item(ns)</li>}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}