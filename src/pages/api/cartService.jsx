// CRA: set REACT_APP_API_BASE_URL in .env (e.g. http://localhost:8000)
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include", // using cookie-based guest cart; keep CORS supports_credentials: true
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

const cartService = {
  getCart: () => request("/api/client/cart"),

  upsertItem: (payload) => {
    if (typeof payload.product_id !== "string") {
      throw new Error("product_id must be a string");
    }
    return request("/api/client/cart/items", { method: "POST", body: payload });
  },

  updateItem: (id, patch) =>
    request(`/api/client/cart/items/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      body: patch,
    }),

  removeItem: (id) =>
    request(`/api/client/cart/items/${encodeURIComponent(String(id))}`, {
      method: "DELETE",
    }),

  clearCart: () => request("/api/client/cart/clear", { method: "POST" }),
};

export default cartService;
