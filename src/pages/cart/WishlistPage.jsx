// src/pages/wishlist/WishlistPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";
import { FiTrash2, FiPlus, FiMinus, FiHeart } from "react-icons/fi";

/* ------------ helpers ------------ */
const EXCHANGE_RATE = 4100;
const fmtKHR = (n) => `៛ ${Math.round(n).toLocaleString()}`;

/* localStorage wishlist (optional) */
const WKEY = "wishlist";
const loadLocal = () => {
  try {
    const raw = localStorage.getItem(WKEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};
const saveLocal = (list) => {
  try {
    localStorage.setItem(WKEY, JSON.stringify(list));
  } catch {}
};
const removeLocal = (id) => {
  const list = loadLocal().filter((x) => String(x.id) !== String(id));
  saveLocal(list);
  return list;
};

export default function WishlistPage() {
  const { items, add, setQty, remove, toggleWish } = useCart();

  // local-only wishes (products not in cart yet)
  const [localWish, setLocalWish] = useState(() => loadLocal());
  const [query, setQuery] = useState("");

  // wishes that live in cart
  const cartWishes = useMemo(
    () =>
      Object.values(items || {})
        .filter((it) => it?.wish)
        .map((it) => ({
          source: "cart",
          id: String(it.product?.id),
          qty: it.qty ?? 1,
          product: it.product,
        })),
    [items]
  );

  // avoid duplicates: if same id exists in cart wish, hide local copy
  const localWishesFiltered = useMemo(() => {
    const inCart = new Set(cartWishes.map((w) => String(w.id)));
    return (localWish || [])
      .filter((p) => !inCart.has(String(p.id)))
      .map((p) => ({
        source: "local",
        id: String(p.id),
        qty: 0,
        product: {
          id: String(p.id),
          name: p.medicine?.medicine_name ?? p.name ?? "Unknown",
          medicine: {
            id: p.medicine?.id ?? p.id,
            price: Number(p.medicine?.price ?? 0),
            image: p.medicine?.image ?? null,
            weight: p.medicine?.weight ?? "",
            medicine_name: p.medicine?.medicine_name ?? p.name ?? "Unknown",
            units: p.medicine?.units ?? [],
          },
        },
      }));
  }, [localWish, cartWishes]);

  // final list (merge + search)
  const list = useMemo(() => {
    const all = [...cartWishes, ...localWishesFiltered];
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((w) => {
      const m = w.product?.medicine;
      const name = m?.medicine_name || w.product?.name || "";
      return name.toLowerCase().includes(q);
    });
  }, [cartWishes, localWishesFiltered, query]);

  /* actions */
  const addOne = async (entry) => {
    if (entry.source === "cart") {
      await setQty(entry.id, (entry.qty || 0) + 1);
    } else {
      // ✅ correctly call add(product, qty)
      await add(entry.product, 1);
    }
  };

  const minusOne = async (entry) => {
    if (entry.source !== "cart") return;
    const next = Math.max((entry.qty || 1) - 1, 1);
    await setQty(entry.id, next);
  };

  const removeWish = async (entry) => {
    if (entry.source === "cart") {
      await toggleWish(entry.id); // flips wish to false (persist to DB)
    } else {
      const next = removeLocal(entry.id);
      setLocalWish(next);
    }
  };

  const deleteFromCart = async (entry) => {
    if (entry.source === "cart") await remove(entry.id);
  };

  useEffect(() => {
    // keep local state in sync if other parts of app change localStorage
    const onStorage = (e) => {
      if (e.key === WKEY) setLocalWish(loadLocal());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-emerald-700 mb-6">
        ការចូលចិត្តផលិតផល (Wishlist)
      </h1>

      {/* search */}
      <div className="mb-4">
        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="ស្វែងរកផលិតផល…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {list.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          មិនមានផលិតផលក្នុងបញ្ជីចូលចិត្តទេ
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((it) => {
            const med = it.product?.medicine ?? {};
            const name = med.medicine_name || it.product?.name || "—";
            const img =
              med.image || "https://via.placeholder.com/120x120?text=No+Image";
            const usd = Number(med.price || 0);
            const khr = usd * EXCHANGE_RATE;
            const old = usd ? usd * 1.02 : 0; // strike price for UI

            return (
              <div
                key={`${it.source}:${it.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border p-3"
              >
                {/* image */}
                <img
                  src={img}
                  alt={name}
                  className="w-16 h-16 rounded border object-cover"
                />

                {/* info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                      លក់អ្នកជំងឺ
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                      ដឹកជញ្ជូនគ្រួសារ
                    </span>
                  </div>
                </div>

                {/* price */}
                <div className="text-right mr-2">
                  <div className="text-emerald-600 font-semibold">
                    {fmtKHR(khr)}
                  </div>
                  {old > 0 && (
                    <div className="text-xs text-gray-400 line-through">
                      {fmtKHR(old * EXCHANGE_RATE)}
                    </div>
                  )}
                </div>

                {/* actions */}
                {it.source === "cart" ? (
                  <div className="flex items-center gap-2">
                    <button
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                      onClick={() => minusOne(it)}
                      title="-"
                    >
                      <FiMinus />
                    </button>
                    <div className="w-10 text-center">{it.qty || 1}</div>
                    <button
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                      onClick={() => addOne(it)}
                      title="+"
                    >
                      <FiPlus />
                    </button>

                    <button
                      className="ml-2 text-gray-500 hover:text-pink-500"
                      title="Remove from wishlist"
                      onClick={() => removeWish(it)}
                    >
                      <FiHeart />
                    </button>

                    <button
                      className="text-gray-500 hover:text-red-600"
                      title="Remove from cart"
                      onClick={() => deleteFromCart(it)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => addOne(it)}
                    >
                      បញ្ចូលកន្រ្តក
                    </button>
                    <button
                      className="text-gray-500 hover:text-pink-500"
                      title="Remove from wishlist"
                      onClick={() => {
                        const next = removeLocal(it.id);
                        setLocalWish(next);
                      }}
                    >
                      <FiHeart />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* pagination placeholder */}
      <div className="mt-6 flex justify-center">
        <button className="px-6 py-2 rounded-md border">1</button>
      </div>
    </div>
  );
}
