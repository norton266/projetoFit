import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthHydrator } from "./components/AuthHydrator"
import AppRoutes from "./app/routes"
import "./index.css" // (tailwind)

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthHydrator>
          <AppRoutes />
        </AuthHydrator>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
