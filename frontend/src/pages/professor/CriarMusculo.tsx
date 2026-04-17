import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createMusculo } from "../../services/musculos"

export default function CriarMusculo() {
  const navigate = useNavigate()

  const [nome, setNome] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: any) {
    e.preventDefault()
    setLoading(true)

    try {
      await createMusculo({ nome })
      navigate(-1) // volta pra tela anterior
    } catch (err: any) {
      if (err?.response?.data?.nome) {
        alert("Esse músculo já existe.")
      } else {
        alert("Erro ao criar músculo")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Criar Músculo</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do músculo
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Ex: Bíceps"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded-lg"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  )
}