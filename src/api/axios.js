import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Otomatis nempel Token Authorization tiap kali request API dipanggil!
api.interceptors.request.use(
  (config) => {
    // Sesuaikan 'token' atau 'access_token' dengan nama key saat kamu simpan token di localStorage
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
