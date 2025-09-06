// src/pages/product/AllProduct.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { getProducts } from "../api/prodductService";

const EXCHANGE_RATE = 4100;

/* ------- Local Wishlist Helpers ------- */
const WKEY = "wishlist";
const loadLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(WKEY)) || [];
  } catch {
    return [];
  }
};
const saveLocal = (arr) => {
  try {
    localStorage.setItem(WKEY, JSON.stringify(arr));
  } catch {}
};
const hasLocal = (id) => loadLocal().some((p) => String(p.id) === String(id));
const addLocal = (p) => {
  const list = loadLocal();
  if (!hasLocal(p.id)) {
    list.push(p);
    saveLocal(list);
  }
};
const removeLocal = (id) =>
  saveLocal(loadLocal().filter((x) => String(x.id) !== String(id)));

/* ------- Product Key Helper ------- */
const productKey = (p) =>
  String(p?.product_id ?? p?.id ?? p?.medicine?.id ?? "");

/* ------- Normalize for Wishlist ------- */
const normalizeForWishlist = (p) => {
  const id = productKey(p);
  return {
    id,
    name: p?.medicine?.medicine_name ?? p?.name ?? "Unknown",
    medicine: {
      id,
      medicine_name: p?.medicine?.medicine_name ?? p?.name ?? "Unknown",
      price: Number(p?.medicine?.price ?? 0),
      weight: p?.medicine?.weight ?? null,
      units: Array.isArray(p?.medicine?.units) ? p.medicine.units : [],
      image: p?.medicine?.image ?? null,
    },
  };
};

export default function AllProduct() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "";
  const searchParam = (searchParams.get("search") || "").trim();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [wishVersion, setWishVersion] = useState(0);

  const { items, add, setQty, remove, toggleWish } = useCart();

  /* ------- Fetch Products ------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        let list;
        try {
          list = await getProducts({
            category: categoryParam,
            search: searchParam,
          });
        } catch {
          try {
            list = await getProducts(categoryParam, searchParam);
          } catch {
            list = await getProducts();
          }
        }
        const normalized = Array.isArray(list) ? list : list?.data || [];
        if (cancelled) return;

        let filtered = normalized;
        if (categoryParam) {
          const cp = String(categoryParam).toLowerCase();
          filtered = filtered.filter((p) => {
            const cat = p.category || p.medicine?.category || {};
            const cid = String(cat.id ?? "");
            const cslug = String(cat.slug ?? "");
            const cname = String(cat.name ?? cat.category_name ?? "");
            return (
              cid === String(categoryParam) ||
              cslug.toLowerCase() === cp ||
              cname.toLowerCase() === cp
            );
          });
        }
        if (searchParam) {
          const s = searchParam.toLowerCase();
          filtered = filtered.filter((p) => {
            const name =
              p.medicine?.medicine_name || p.medicine?.name || p.name || "";
            return String(name).toLowerCase().includes(s);
          });
        }

        setProducts(filtered);
      } catch (e) {
        console.error("Error fetching products:", e);
        setProducts([]);
        setLoadError("Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryParam, searchParam]);

  /* ------- Wishlist State ------- */
  const cartWishIds = useMemo(
    () =>
      new Set(
        Object.entries(items || {})
          .filter(([, it]) => it?.wish)
          .map(([id]) => String(id))
      ),
    [items]
  );
  const localWishIds = useMemo(
    () => new Set(loadLocal().map((p) => String(p.id))),
    [wishVersion]
  );
  const isWishlisted = (id) =>
    cartWishIds.has(String(id)) || localWishIds.has(String(id));

  /* ------- Cart Actions ------- */
  const increase = async (p) => {
    const key = productKey(p);
    const current = items?.[key]?.qty ?? 0;
    try {
      if (current > 0) {
        setQty(key, current + 1);
        toast.success(`Increased quantity to ${current + 1}`);
      } else {
        add(p, 1);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update cart");
    }
  };

  const decrease = async (p) => {
    const key = productKey(p);
    const current = items?.[key]?.qty ?? 0;
    try {
      if (current > 0) {
        
        setQty(key, current - 1);
        toast.info("Removed from cart");
      } else {
        toast.info("Not in cart");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update cart");
    }
  };

  const toggleWishlistBtn = async (item) => {
    const id = productKey(item);
    const inCart = !!items?.[id];
    try {
      if (inCart) {
        toast.success(
          isWishlisted(id) ? "Removed from Wishlist" : "Added to Wishlist"
        );
        toggleWish(id);
      } else {
        if (hasLocal(id)) {
          removeLocal(id);
          toast.info("Item removed from Wishlist");
        } else {
          addLocal(normalizeForWishlist(item));
          toast.success("Item added to Wishlist");
        }
        setWishVersion((v) => v + 1);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update wishlist");
    }
  };

  /* ------- UI ------- */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-2">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
            >
              <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 mt-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="max-w-5xl mx-auto">
        {loadError && <div className="px-2 text-red-600 mb-3">{loadError}</div>}

        {!loadError && products.length === 0 ? (
          <div className="px-2 py-10 text-center text-gray-500">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {products.map((item) => {
              const pid = productKey(item);
              const qty = items?.[pid]?.qty ?? 0;
              const usdPrice = Number(item.medicine?.price) || 0;
              const khrPrice = usdPrice * EXCHANGE_RATE;
              const wished = isWishlisted(pid);

              return (
                <div
                  key={pid}
                  className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                >
                  <button
                    onClick={() => toggleWishlistBtn(item)}
                    className={`absolute top-2 right-2 text-xl ${
                      wished ? "text-red-500" : "text-gray-400"
                    } hover:text-red-500`}
                  >
                    {wished ? <FaHeart /> : <FaRegHeart />}
                  </button>

                  <Link to={`/product-detail/${pid}`}>
                    <img
                      src={
                        item.medicine?.image ||
                        "https://via.placeholder.com/200x150"
                      }
                      alt={item.medicine?.medicine_name || item.name || "—"}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  </Link>

                  <h2 className="text-md font-semibold text-green-500">
                    <Link to={`/product-detail/${pid}`}>
                      {item.medicine?.medicine_name ?? item.name ?? "Unknown"}
                      {item.medicine?.weight
                        ? ` | ${item.medicine.weight}`
                        : ""}
                    </Link>
                  </h2>

                  <p className="text-sm p-2 text-gray-600 dark:text-gray-300">
                    Type:{" "}
                    {(item.medicine?.units ?? [])
                      .map((u) => u?.unit_name)
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  <p className="text-md text-gray-600 dark:text-gray-300">
                    {usdPrice
                      ? `$ ${usdPrice.toFixed(
                          2
                        )} | ៛ ${khrPrice.toLocaleString()}`
                      : "—"}
                  </p>

                  <div className="flex justify-center items-center gap-2 mt-3 border rounded">
                    <button
                      onClick={() => decrease(item)}
                      className="px-2 py-1 text-3xl"
                    >
                      -
                    </button>
                    <span className="text-center px-8 font-medium">{qty}</span>
                    <button
                      onClick={() => increase(item)}
                      className="px-2 py-1 text-2xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <ToastContainer position="top-left" autoClose={1000} />
    </div>
  );
}
