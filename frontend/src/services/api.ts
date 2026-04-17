import axios from "axios"

// Ajuste para a sua URL base
// Ex.: http://localhost:8080
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

export const api = axios.create({
  baseURL: API_BASE_URL,
})

// Interceptor: adiciona Authorization automaticamente quando existir token
api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access_token")
  if (access) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${access}`
  }
  return config
})
