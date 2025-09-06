// src/context/CartContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../pages/api/client";
import { toast } from "react-toastify";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState({}); // { [product_id]: CartItem }

  // ---- helpers ----
  const keyFromProduct = (p) =>
    String(p?.product_id ?? p?.id ?? p?.medicine?.id ?? "");

  const keyFromServerItem = (it) =>
    String(it?.product_id ?? it?.id ?? it?.medicine_id ?? "");

  // Strong image fallback chain
  const pickImage = (src) =>
    src?.product?.medicine?.image ??
    src?.medicine?.image ??
    src?.product?.image ??
    src?.image ??
    null;

  // Normalize server item -> UI shape (with image fallback)
  const normalizeServerItem = (it) => {
    const id = keyFromServerItem(it);
    const med = it?.product?.medicine || it?.medicine || {};
    const name =
      med?.medicine_name ||
      it?.product?.name ||
      it?.medicine_name ||
      it?.name ||
      "Unknown";
    const price =
      Number(
        med?.price ?? it?.price_usd ?? it?.price ?? it?.product?.price ?? 0
      ) || 0;
    const image = pickImage(it);

    return {
      [id]: {
        product: {
          id,
          name,
          medicine: {
            id,
            medicine_name: name,
            price,
            image, // ✅ keep image
            weight: med?.weight ?? null,
            units: Array.isArray(med?.units) ? med.units : [],
          },
        },
        qty: Number(it?.qty ?? it?.quantity ?? 1),
        selected: Boolean(it?.selected ?? true),
        wish: Boolean(it?.wish ?? false),
      },
    };
  };

  // Build optimistic UI item from product (with image fallback)
  const buildOptimisticItem = (product, qty = 1) => {
    const id = keyFromProduct(product);
    const name = product?.name || product?.medicine?.medicine_name || "Unknown";
    const price = Number(product?.medicine?.price ?? product?.price ?? 0) || 0;
    const image = product?.medicine?.image || product?.image || null; // ✅ keep image when adding
    const weight = product?.medicine?.weight ?? product?.weight ?? null;
    const units = Array.isArray(product?.medicine?.units)
      ? product.medicine.units
      : [];

    return {
      product: {
        id,
        name,
        medicine: {
          id,
          medicine_name: name,
          price,
          image, // ✅
          weight,
          units,
        },
      },
      qty,
      selected: true,
      wish: false,
    };
  };

  // ---- API ----
  const refresh = async () => {
    try {
      const res = await api.get("/client/cart");
      const data = res?.data?.data?.items || res?.data?.items || [];
      const mapped = {};
      for (const it of data) Object.assign(mapped, normalizeServerItem(it));
      setItems(mapped);
    } catch (e) {
      console.error("Failed to fetch cart", e);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const add = async (product, qty = 1) => {
    const id = keyFromProduct(product);
    if (!id) {
      toast.error("Cannot add: invalid product");
      return;
    }

    const name = product?.name || product?.medicine?.medicine_name || "Unknown";
    const price = Number(product?.medicine?.price ?? product?.price ?? 0) || 0;

    // Optimistic
    setItems((prev) => {
      const existing = prev[id];
      const newQty = (existing?.qty || 0) + qty;
      return {
        ...prev,
        [id]: existing
          ? { ...existing, qty: newQty, selected: true }
          : buildOptimisticItem(product, qty),
      };
    });

    try {
      await api.post("/client/cart/items", {
        product_id: id,
        name,
        price_usd: price,
        qty,
      });
      await refresh(); 
    
    } catch (e) {
      console.error("Add to cart failed (server)", e?.response?.data || e);
      await refresh();
    }
  };

  const setQty = async (id, qty) => {
    setItems((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], qty } } : prev
    );
    try {
      await api.patch(`/client/cart/items/${id}`, { qty });
      await refresh();
    } catch (e) {
      console.error("setQty failed", e?.response?.data || e);
      await refresh();
    }
  };

  const remove = async (id) => {
    setItems((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    try {
      await api.delete(`/client/cart/items/${id}`);
      await refresh();
    } catch (e) {
      console.error("remove failed", e?.response?.data || e);
      await refresh();
    }
  };

  const toggleSelect = async (id) => {
    const cur = items[id];
    if (!cur) return;
    setItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected: !cur.selected },
    }));
    try {
      await api.patch(`/client/cart/items/${id}`, { selected: !cur.selected });
      await refresh();
    } catch (e) {
      console.error("toggleSelect failed", e?.response?.data || e);
      await refresh();
    }
  };

  const toggleWish = async (id) => {
    const cur = items[id];
    if (!cur) return;
    setItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], wish: !cur.wish },
    }));
    try {
      await api.patch(`/client/cart/items/${id}`, { wish: !cur.wish });
      await refresh();
    } catch (e) {
      console.error("toggleWish failed", e?.response?.data || e);
      await refresh();
    }
  };

  // derived counts
  const cartCount = useMemo(
    () => Object.values(items).reduce((sum, it) => sum + (it.qty || 0), 0),
    [items]
  );
  const wishCount = useMemo(
    () => Object.values(items).reduce((sum, it) => sum + (it.wish ? 1 : 0), 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        setQty,
        remove,
        toggleSelect,
        toggleWish,
        refresh,
        cartCount,
        wishCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
