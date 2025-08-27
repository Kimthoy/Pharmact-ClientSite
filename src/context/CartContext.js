// src/context/CartContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import cartService from "../pages/api/cartService";
import { getProductById } from "../pages/api/prodductService"; // optional (for hydration)

const CartCtx = createContext(null);

// -------- helpers (no React state here) --------
const getProductId = (it) => {
  const raw =
    it?.product?.id ??
    it?.product_id ??
    it?.id ??
    it?.product?.medicine?.id ??
    null;
  return raw != null ? String(raw) : null; // always string
};

const getProductName = (it) =>
  it?.product?.name ??
  it?.name ??
  it?.product?.medicine?.medicine_name ??
  "Unknown";

const getProductPrice = (it) =>
  Number(it?.product?.medicine?.price ?? it?.price_usd ?? it?.price ?? 0);

// build items map from server and keep any client-known details (image, etc.)
const toItemsMap = (serverCart, prev = {}) => {
  const map = {};
  for (const it of serverCart?.items ?? []) {
    const id = String(it.product_id ?? it.id);
    const prevProd = prev[id]?.product;

    map[id] = {
      product: {
        id,
        name: it.name ?? prevProd?.name ?? "Unknown",
        medicine: {
          price: Number(it.price_usd ?? prevProd?.medicine?.price ?? 0),
          image: prevProd?.medicine?.image ?? null,
          weight: prevProd?.medicine?.weight ?? null,
          units: prevProd?.medicine?.units ?? [],
          medicine_name:
            prevProd?.medicine?.medicine_name ?? it.name ?? "Unknown",
        },
      },
      qty: Number(it.qty ?? 1),
      selected: !!it.selected,
      wish: !!it.wish,
    };
  }
  return map;
};

// optional: fetch full product details to hydrate image/weight/units
async function hydrateDetails(baseMap) {
  const ids = Object.keys(baseMap);
  const out = { ...baseMap };
  await Promise.all(
    ids.map(async (id) => {
      try {
        const p = await getProductById(id); // expects { id, medicine: {...} }
        const med = p?.medicine ?? {};
        out[id] = {
          ...out[id],
          product: {
            ...out[id].product,
            name: med.medicine_name ?? out[id].product.name,
            medicine: {
              ...out[id].product.medicine,
              image: med.image ?? out[id].product.medicine.image,
              weight: med.weight ?? out[id].product.medicine.weight,
              units: med.units ?? out[id].product.medicine.units,
              medicine_name:
                med.medicine_name ?? out[id].product.medicine.medicine_name,
            },
          },
        };
      } catch (_) {
        // ignore, keep base
      }
    })
  );
  return out;
}

export function CartProvider({ children }) {
  // ✅ setItems is defined here and used below
  const [items, setItems] = useState({});

  const refresh = async () => {
    const cart = await cartService.getCart();
    // keep previous client details when rebuilding the map
    const base = toItemsMap(cart, items);
    setItems(base);
    // optional hydration: uncomment if you want images/weight auto-filled
    try {
      const enriched = await hydrateDetails(base);
      setItems(enriched);
    } catch (_) {}
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = async (item) => {
    const pid = getProductId(item);
    if (!pid) return;

    // ✅ optimistic update so UI updates immediately (and preserves image)
    setItems((prev) => {
      const current = prev[pid];
      const nextQty = (current?.qty ?? 0) + (item?.qty ?? 1);
      return {
        ...prev,
        [pid]: {
          product: item.product,
          qty: nextQty,
          selected: true,
          wish: current?.wish ?? false,
        },
      };
    });

    await cartService.upsertItem({
      product_id: pid,
      name: getProductName(item),
      price_usd: getProductPrice(item),
      qty: item?.qty ?? 1,
      selected: true,
      wish: false,
    });

    await refresh();
  };

  const setQty = async (id, qty) => {
    const key = String(id);
    await cartService.updateItem(key, { qty: Number(qty ?? 1) });
    await refresh();
  };

  const remove = async (id) => {
    const key = String(id);
    await cartService.removeItem(key);
    await refresh();
  };

  const toggleSelect = async (id) => {
    const key = String(id);
    await cartService.updateItem(key, { selected: !items[key]?.selected });
    await refresh();
  };

  const toggleWish = async (id) => {
    const key = String(id);
    await cartService.updateItem(key, { wish: !items[key]?.wish });
    await refresh();
  };

  const clear = async () => {
    await cartService.clearCart();
    await refresh();
  };

  // derived counters
  const { countLines, countQty, countSelectedLines, countSelectedQty } =
    useMemo(() => {
      const ids = Object.keys(items);
      const countLines = ids.length;
      const countQty = ids.reduce((s, k) => s + (items[k]?.qty ?? 0), 0);
      const countSelectedLines = ids.filter((k) => items[k]?.selected).length;
      const countSelectedQty = ids.reduce(
        (s, k) => s + ((items[k]?.selected ? items[k]?.qty : 0) ?? 0),
        0
      );
      return { countLines, countQty, countSelectedLines, countSelectedQty };
    }, [items]);

  const value = useMemo(
    () => ({
      items,
      add,
      setQty,
      remove,
      toggleSelect,
      toggleWish,
      clear,
      refresh,
      countLines,
      countQty,
      countSelectedLines,
      countSelectedQty,
    }),
    [items, countLines, countQty, countSelectedLines, countSelectedQty]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
