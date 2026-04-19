import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    // Don't redirect on /me or /login — handle 401 locally in those pages
    if (error.response?.status === 401 && !url.includes("/auth/me") && !url.includes("/auth/login")) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
