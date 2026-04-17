import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTemplates } from "../../hooks/useTemplates"
import { atribuirTemplate } from "../../services/templates"
import type {Aluno} from "../../hooks/useTemplates"

function formatAluno(a: Aluno) {
  const nome = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim()
  return nome || a.username
}

export default function Templates() {
  const navigate = useNavigate()

  const { templates, alunos, loading, error } = useTemplates()

  const [alunoId, setAlunoId] = useState<number | "">("")
  const [search, setSearch] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return templates

    return templates.filter((t) =>
      [t.titulo, t.descricao]
        .some(field => field?.toLowerCase().includes(q))
    )
  }, [search, templates])

  async function atribuir(templateId: number) {
    setLocalError(null)

    if (!alunoId) {
      setLocalError("Selecione um aluno para atribuir o template.")
      return
    }

    setBusyId(templateId)
    try {
      await atribuirTemplate(templateId, alunoId)

      const go = window.confirm(
        "Template atribuído com sucesso! Quer ver os treinos desse aluno agora?"
      )

      if (go) navigate(`/professor/treinos/aluno/${alunoId}`)
    } catch {
      setLocalError("Erro ao atribuir template.")
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
            Selecione um aluno e atribua um treino template.
          </p>
        </div>

        <button
          onClick={() => navigate("/professor/treinos/novo")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
          }}
        >
          + Novo template
        </button>
      </div>

      {(error || localError) && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#fff2f2", border: "1px solid #ffd0d0" }}>
          <strong>Ops:</strong> {error || localError}
        </div>
      )}

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ padding: 16, border: "1px solid #e6e6e6", borderRadius: 14, background: "#fff" }}>
          <h3>Selecionar aluno</h3>

          <select
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value ? Number(e.target.value) : "")}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option value="">Selecione...</option>
            {alunos.map((a: Aluno) => (
              <option key={a.id} value={a.id}>
                {formatAluno(a)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ padding: 16, border: "1px solid #e6e6e6", borderRadius: 14, background: "#fff" }}>
          <h3>Buscar</h3>

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
          <div style={{ padding: 16 }}>Carregando templates...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: 16 }}>Nenhum template encontrado.</div>
        ) : (
          filtrados.map((t) => (
            <div key={t.id} style={{ padding: 16, borderRadius: 14, background: "#fff", border: "1px solid #e6e6e6" }}>
              <h3>{t.titulo}</h3>

              <p>{t.descricao || "Sem descrição."}</p>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => navigate(`/professor/treinos/editar/${t.id}`)}>
                  Editar
                </button>

                <button
                  disabled={!alunoId || busyId === t.id}
                  onClick={() => atribuir(t.id)}
                >
                  {busyId === t.id ? "Atribuindo..." : "Atribuir"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}