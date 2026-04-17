import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  getTreino,
  listExerciciosDoTreino,
  type Exercicio,
  type Treino,
} from "../services/treinos"

export default function DetalheTreino() {
  const { id } = useParams()

  const treinoId = Number(id)

  const treinoQuery = useQuery<Treino>({
    queryKey: ["treino", treinoId],
    queryFn: () => getTreino(treinoId),
    enabled: !!treinoId,
  })

  const exerciciosQuery = useQuery<Exercicio[]>({
    queryKey: ["exercicios-do-treino", treinoId],
    queryFn: () => listExerciciosDoTreino(treinoId),
    enabled: !!treinoId,
  })

  // 🔄 Loading
  if (treinoQuery.isLoading || exerciciosQuery.isLoading) {
    return <div className="p-6">Carregando...</div>
  }

  // ❌ Erro
  if (treinoQuery.isError || exerciciosQuery.isError) {
    return <div className="p-6 text-red-600">Erro ao carregar treino</div>
  }

  const treino = treinoQuery.data
  const exercicios = exerciciosQuery.data ?? []

  // 🛑 Garantia pro TypeScript
  if (!treino) {
    return <div className="p-6">Treino não encontrado</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{treino.titulo}</h1>

      <p className="text-gray-600 mb-6">
        {treino.descricao || "Sem descrição"}
      </p>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 font-semibold">
          Exercícios
        </div>

        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Séries</th>
              <th className="text-left p-3">Repetições</th>
            </tr>
          </thead>

          <tbody>
            {exercicios.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-3 text-gray-600">
                  Nenhum exercício neste treino.
                </td>
              </tr>
            ) : (
              exercicios.map((ex) => (
                <tr key={ex.id} className="border-b">
                  <td className="p-3">{ex.nome}</td>
                  <td className="p-3">{ex.series}</td>
                  <td className="p-3">{ex.repeticoes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}