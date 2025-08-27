import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { Accept: "application/json" },
});

const orderService = {
  create(payload) {
    // payload = { customer:{...}, items:[...], payment_method, delivery_slot, note }
    return API.post("/client/orders", payload).then((r) => r.data);
  },
};

export default orderService;
