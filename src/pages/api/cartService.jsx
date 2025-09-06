import API from "./client";

const getCart = async () => (await API.get("/client/cart")).data;
const upsertItem = async (payload) =>
  (await API.post("/client/cart/item", payload)).data;
const updateItem = async (id, payload) =>
  (await API.patch(`/client/cart/item/${id}`, payload)).data;
const removeItem = async (id) =>
  (await API.delete(`/client/cart/item/${id}`)).data;
const clearCart = async () => (await API.delete("/client/cart/clear")).data;

export default { getCart, upsertItem, updateItem, removeItem, clearCart };
