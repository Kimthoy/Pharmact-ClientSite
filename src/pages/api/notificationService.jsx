// src/pages/api/notificationService.jsx
import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

export const API = axios.create({
  baseURL: BASE_URL.replace(/\/+$/, ""), // trim trailing slash
  headers: { Accept: "application/json" },
  withCredentials: false, // ← set to true ONLY if your Laravel sends cookies
  timeout: 15000,
});

// optional: log server errors so you see 500 details in console
API.interceptors.response.use(
  (r) => r,
  (err) => {
    // console.error("API error:", err?.response?.status, err?.response?.data || err.message);
    // throw err;
  }
);

// unwrap either {data:[...]} or plain array
const unwrap = (res) => res?.data?.data ?? res?.data ?? [];

export const getAlerts = async () => {
  const res = await axios.get("http://localhost:8000/api/client/alerts");
  return res;
};

export const markRead = async (id) => {
  await API.post(`/client/alerts/${id}/read`);
};

export const markAllRead = async () => {
  await API.post("/client/alerts/read-all");
};
