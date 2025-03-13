import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Intercepta requisições e adiciona o token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepta respostas para tratar erro de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expirado. Redirecionando para login...");
      localStorage.removeItem("token"); // Remove o token expirado
      window.location.href = "/"; // Redireciona para login
    }

    return Promise.reject(error);
  }
);

export default api;
