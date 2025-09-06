const BASE_URL = "http://localhost:8000/api";

export async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch categories (${res.status})`);
  }

  const data = await res.json();
  // normalize Laravel’s response: [] or { data: [] }
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  return [];
}
