import { Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import Dashboard from "../pages/dashboards/Dashboard"
import Treinos from "../pages/Treinos"
import AppLayout from "../components/layout/AppLayout"
import Register from "../pages/Register"
import CadastrosPendentes from "../pages/CadastrosPendentes"
import TreinosPorAluno from "../pages/TreinosPorAluno"
import NovoTreino from "../pages/professor/NovoTreino"
import Templates from "../pages/professor/Templates"
import DetalheTreino from "../pages/DetalheTreino"
import ExercicioCreate from "../pages/professor/NovoExercicio"
import CriarMusculo from "../pages/professor/CriarMusculo"


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="treinos" element={<Treinos />} />
        <Route path="cadastros-pendentes" element={<CadastrosPendentes />} />
        <Route path="treinos-por-aluno" element={<TreinosPorAluno />} />
        <Route path="/app/treinos/:id" element={<DetalheTreino/>} />
        
      </Route>
      <Route path="/professor/treinos/novo" element={<NovoTreino />} />
      <Route path="/professor/templates" element={<Templates />} />
      <Route path="/professor/exercicios/novo" element={<ExercicioCreate />} />
      <Route path="/professor/musculos/novo" element={<CriarMusculo/>} />


      <Route path="/register" element={<Register />} />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}
