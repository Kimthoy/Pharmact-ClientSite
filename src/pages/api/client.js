import axios from "axios";

const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8000/api"; // <-- /api because we used routes/api.php

const GUEST_TOKEN_KEY = "guest_token";

function getGuestToken() {
  let t = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!t) {
    // simple random token; replace with uuid if you like
    t = `guest_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    localStorage.setItem(GUEST_TOKEN_KEY, t);
  }
  return t;
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // stateless API; no cookies/sessions needed
});

api.interceptors.request.use((cfg) => {
  const token = getGuestToken();
  cfg.headers = cfg.headers || {};
  cfg.headers["X-Guest-Token"] = token;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const r = err?.response;
    console.error("API ERROR", {
      url: (err.config?.baseURL || "") + (err.config?.url || ""),
      method: err.config?.method?.toUpperCase(),
      status: r?.status,
      data: r?.data,
    });
    return Promise.reject(err);
  }
);

export default api;
