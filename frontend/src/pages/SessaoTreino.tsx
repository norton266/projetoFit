import { useParams } from "react-router-dom"
import { useState } from "react"
import { useSessao } from "../hooks/useSessao"

export default function SessaoTreino() {
  const { id } = useParams()
  const { data, isLoading } = useSessao(id)

  const [checked, setChecked] = useState<Record<number, boolean>>({})

  const toggle = (id: number) => {
    setChecked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }
  console.log(data)
  if (isLoading) {
    return <p className="p-6">Carregando sessão...</p>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-green-600">
          Treino iniciado
        </h1>
        <p className="text-gray-700 mt-1">
          {data?.treino.titulo}
          
        </p>
      </div>

      {/* Exercícios */}
      <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">
          Exercícios
        </h2>
        
        {data?.exercicios?.map((ex: any) => (
          <label
            key={ex.id}
            className="flex items-center justify-between border rounded-lg p-3 cursor-pointer"
            
          >
            <div>
              <p className="font-medium">{ex.nome}</p>
              <p className="text-xs text-gray-500">
                {ex.series}x {ex.repeticoes}
              </p>
            </div>

            <input
              type="checkbox"
              checked={!!checked[ex.id]}
              onChange={() => toggle(ex.id)}
              className="w-5 h-5"
            />
          </label>
        ))}
      </div>

      {/* Botão finalizar */}
      <button
        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
      >
        Finalizar treino
      </button>
    </div>
  )
}