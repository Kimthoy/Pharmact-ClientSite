import axios from "axios";
import api from "../api/client";
// Use CRA env if set, else default to localhost (matches your CORS)
const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

// Create axios instance
const API = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { Accept: "application/json" },
  withCredentials: true, // ✅ send/receive cookies (guest cart, Sanctum, etc.)
});

// (optional) small helper to unwrap data & surface errors nicely
async function unwrap(promise) {
  try {
    const res = await promise;
    // many of your endpoints return { data: ... }
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg =
      err?.response?.data?.message || err?.message || "Request failed";
    throw new Error(msg);
  }
}

export async function getProducts(arg1, arg2) {
  let category, search;
  if (typeof arg1 === "object" && arg1) {
    category = arg1.category ?? "";
    search = arg1.search ?? "";
  } else {
    category = arg1 ?? "";
    search = arg2 ?? "";
  }

  const res = await api.get("/client/products", {
    params: {
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
    },
  });
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
}
/** Get single product by stock/product id (stringified) */
export async function getProductById(id) {
  const pid = encodeURIComponent(String(id));
  return unwrap(API.get(`/client/products/${pid}`));
}

// (optional) bulk fetch optimization for hydration if you add such endpoint later
export async function getProductsByIds(ids = []) {
  // expects a backend like: GET /api/client/products?ids[]=1&ids[]=2
  const params = new URLSearchParams();
  ids.forEach((i) => params.append("ids[]", String(i)));
  return unwrap(API.get(`/client/products`, { params }));
}
