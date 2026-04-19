import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    // Don't redirect on /me — it's an auth check, a 401 just means not logged in
    if (error.response?.status === 401 && !url.includes("/auth/me")) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
