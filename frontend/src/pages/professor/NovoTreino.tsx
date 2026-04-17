import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../services/api"

type Usuario = {
  id: number
  username: string
  first_name?: string
  last_name?: string
}

type Exercicio = {
  id: number
  nome: string
}

type TreinoTipo = "TEMPLATE" | "ALUNO"

type TreinoItemForm = {
  exercicio_id: number | ""
  ordem: number
  series: number
  repeticoes: string
  carga: string
  descanso_seg: number
  observacoes: string
}

export default function NovoTreino() {
  const navigate = useNavigate()

  const [tipo, setTipo] = useState<TreinoTipo>("ALUNO")
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [alunoId, setAlunoId] = useState<number | "">("")

  const [alunos, setAlunos] = useState<Usuario[]>([])
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [exSearch, setExSearch] = useState("")

  const [itens, setItens] = useState<TreinoItemForm[]>([
    {
      exercicio_id: "",
      ordem: 1,
      series: 3,
      repeticoes: "8-12",
      carga: "",
      descanso_seg: 60,
      observacoes: "",
    },
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [alunosRes, exerciciosRes] = await Promise.all([
          api.get("/api/professor/meus-alunos/"),
          api.get("/api/exercicios/"),
        ])

        setAlunos(alunosRes.data ?? [])
        setExercicios(exerciciosRes.data ?? [])
      } catch (e) {
        setError("Não foi possível carregar alunos/exercícios.")
      }
    }
    load()
  }, [])

  const exerciciosFiltrados = useMemo(() => {
    const q = exSearch.trim().toLowerCase()
    if (!q) return exercicios
    return exercicios.filter((e) => e.nome.toLowerCase().includes(q))
  }, [exSearch, exercicios])

  function setItem(index: number, patch: Partial<TreinoItemForm>) {
    setItens((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], ...patch }
      return copy
    })
  }

  function addItem() {
    setItens((prev) => [
      ...prev,
      {
        exercicio_id: "",
        ordem: prev.length + 1,
        series: 3,
        repeticoes: "8-12",
        carga: "",
        descanso_seg: 60,
        observacoes: "",
      },
    ])
  }

  function removeItem(index: number) {
    setItens((prev) => {
      const copy = prev.filter((_, i) => i !== index)
      return copy.map((it, i) => ({ ...it, ordem: i + 1 }))
    })
  }

  function validateForm(): string | null {
    if (!titulo.trim()) return "Informe o título do treino."
    if (tipo === "ALUNO" && !alunoId) return "Selecione um aluno."
    if (!itens.length) return "Adicione pelo menos 1 exercício."
    if (itens.some((it) => !it.exercicio_id)) return "Selecione o exercício em todos os itens."
    return null
  }

  async function salvar() {
    setError(null)
    const msg = validateForm()
    if (msg) {
      setError(msg)
      return
    }

    setIsSaving(true)
    try {
      const payload: any = {
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        itens: itens.map((it) => ({
          exercicio_id: it.exercicio_id,
          ordem: it.ordem,
          series: it.series,
          repeticoes: it.repeticoes,
          carga: it.carga,
          descanso_seg: it.descanso_seg,
          observacoes: it.observacoes,
        })),
      }

      if (tipo === "ALUNO") payload.aluno = alunoId

      await api.post("/api/treinos/", payload)
      alert("Treino criado!")
      navigate("/app/dashboard/", { replace: true })
    } catch (e: any) {
      const data = e?.response?.data
      const detail =
        data?.detail ||
        (typeof data === "object" ? JSON.stringify(data) : null) ||
        "Erro ao salvar treino."
      setError(detail)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Criar treino</h1>
          <p style={{ marginTop: 6, color: "#555" }}>
            Crie um treino para um aluno ou salve como template.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
          >
            Cancelar
          </button>
          <button
            disabled={isSaving}
            onClick={salvar}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#fff2f2", border: "1px solid #ffd0d0" }}>
          <strong>Ops:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ padding: 16, border: "1px solid #e6e6e6", borderRadius: 14, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Tipo</h3>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setTipo("ALUNO")}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
                background: tipo === "ALUNO" ? "#111" : "#fff",
                color: tipo === "ALUNO" ? "#fff" : "#111",
              }}
            >
              Para aluno
            </button>

            <button
              onClick={() => {
                setTipo("TEMPLATE")
                setAlunoId("")
              }}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
                background: tipo === "TEMPLATE" ? "#111" : "#fff",
                color: tipo === "TEMPLATE" ? "#fff" : "#111",
              }}
            >
              Template
            </button>
          </div>

          {tipo === "ALUNO" && (
            <div style={{ marginTop: 14 }}>
              <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Selecionar aluno</label>
              <select
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value ? Number(e.target.value) : "")}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              >
                <option value="">Selecione...</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.first_name || a.last_name ? `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim() : a.username}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ padding: 16, border: "1px solid #e6e6e6", borderRadius: 14, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Informações</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Título</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Treino A - Peito/Tríceps"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Observações gerais..."
                rows={4}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", resize: "vertical" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 16, border: "1px solid #e6e6e6", borderRadius: 14, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <h3 style={{ margin: 0 }}>Itens do treino</h3>
            <p style={{ marginTop: 6, color: "#555" }}>Adicione exercícios com séries, reps, carga e descanso.</p>
          </div>

          <button
            onClick={addItem}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
          >
            + Adicionar exercício
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Buscar exercício</label>
          <input
            value={exSearch}
            onChange={(e) => setExSearch(e.target.value)}
            placeholder="Digite para filtrar..."
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {itens.map((it, idx) => (
            <div key={idx} style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <strong>Exercício #{idx + 1}</strong>
                <button
                  onClick={() => removeItem(idx)}
                  disabled={itens.length === 1}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: itens.length === 1 ? "#f6f6f6" : "#fff",
                    cursor: itens.length === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Remover
                </button>
              </div>

              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Exercício</label>
                  <select
                    value={it.exercicio_id}
                    onChange={(e) => setItem(idx, { exercicio_id: e.target.value ? Number(e.target.value) : "" })}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                  >
                    <option value="">Selecione...</option>
                    {exerciciosFiltrados.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Séries</label>
                  <input
                    type="number"
                    value={it.series}
                    onChange={(e) => setItem(idx, { series: Number(e.target.value) })}
                    min={1}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Reps</label>
                  <input
                    value={it.repeticoes}
                    onChange={(e) => setItem(idx, { repeticoes: e.target.value })}
                    placeholder="8-12"
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Carga</label>
                  <input
                    value={it.carga}
                    onChange={(e) => setItem(idx, { carga: e.target.value })}
                    placeholder="20kg / peso corporal"
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Descanso (s)</label>
                  <input
                    type="number"
                    value={it.descanso_seg}
                    onChange={(e) => setItem(idx, { descanso_seg: Number(e.target.value) })}
                    min={0}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, color: "#444", marginBottom: 6 }}>Observações</label>
                  <textarea
                    value={it.observacoes}
                    onChange={(e) => setItem(idx, { observacoes: e.target.value })}
                    rows={2}
                    style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}