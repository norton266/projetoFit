import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  createExercicio,
  listMusculos,
  listEquipamentos,
  type Nivel,
} from "../../services/exercicios"

export default function CriarExercicio() {
  const navigate = useNavigate()
  

  const { data: musculos } = useQuery({
    queryKey: ["musculos"],
    queryFn: listMusculos,
  })

  const { data: equipamentos } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: listEquipamentos,
  })

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    nivel: "INICIANTE" as Nivel,
    video_url: "",
    thumbnail_url: "",
    equipamento: "" as number | "",
    musculos_principais: [] as number[],
    musculos_secundarios: [] as number[],
  })

  function toggleArray(value: number, field: "musculos_principais" | "musculos_secundarios") {
    setForm((prev) => {
      const exists = prev[field].includes(value)
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((v) => v !== value)
          : [...prev[field], value],
      }
    })
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)

    try {
      await createExercicio({
        nome: form.nome,
        descricao: form.descricao,
        nivel: form.nivel,
        video_url: form.video_url,
        thumbnail_url: form.thumbnail_url,
        equipamento: form.equipamento || null,
        musculos_principais: form.musculos_principais,
        musculos_secundarios: form.musculos_secundarios,
      })

      navigate("/app/dashboard")
    } catch (err) {
      alert("Erro ao criar exercício")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Criar Exercício</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border">

        <input
          type="text"
          placeholder="Nome"
          className="w-full border p-2 rounded"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />

        <textarea
          placeholder="Descrição"
          className="w-full border p-2 rounded"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />

        {/* NIVEL */}
        <select
          className="w-full border p-2 rounded"
          value={form.nivel}
          onChange={(e) =>
            setForm({ ...form, nivel: e.target.value as Nivel })
          }
        >
          <option value="INICIANTE">Iniciante</option>
          <option value="INTERMEDIARIO">Intermediário</option>
          <option value="AVANCADO">Avançado</option>
        </select>

        {/* EQUIPAMENTO */}
        <select
          className="w-full border p-2 rounded"
          value={form.equipamento}
          onChange={(e) =>
            setForm({
              ...form,
              equipamento: e.target.value ? Number(e.target.value) : "",
            })
          }
        >
          <option value="">Sem equipamento</option>
          {equipamentos?.map((eq: any) => (
            <option key={eq.id} value={eq.id}>
              {eq.nome}
            </option>
          ))}
        </select>

        {/* MUSCULOS PRINCIPAIS */}
        <div>
          <p className="font-medium mb-2">Músculos principais</p>
          <div className="flex flex-wrap gap-2">
            {musculos?.map((m: any) => (
              <button
                type="button"
                key={m.id}
                onClick={() => toggleArray(m.id, "musculos_principais")}
                className={`px-3 py-1 rounded-full border ${
                  form.musculos_principais.includes(m.id)
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                {m.nome}
              </button>
            ))}
          </div>
        </div>

        {/* MUSCULOS SECUNDARIOS */}
        <div>
          <p className="font-medium mb-2">Músculos secundários</p>
          <div className="flex flex-wrap gap-2">
            {musculos?.map((m: any) => (
              <button
                type="button"
                key={m.id}
                onClick={() => toggleArray(m.id, "musculos_secundarios")}
                className={`px-3 py-1 rounded-full border ${
                  form.musculos_secundarios.includes(m.id)
                    ? "bg-green-600 text-white"
                    : ""
                }`}
              >
                {m.nome}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="URL do vídeo"
          className="w-full border p-2 rounded"
          value={form.video_url}
          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
        />

        <input
          type="text"
          placeholder="URL da thumbnail"
          className="w-full border p-2 rounded"
          value={form.thumbnail_url}
          onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
        />

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={loading}
          style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
            }}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
        <button
            onClick={() => navigate(-1)}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}