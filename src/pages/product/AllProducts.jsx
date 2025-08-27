import React, { useEffect, useState } from "react";
import { getProducts } from "../api/prodductService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const EXCHANGE_RATE = 4100;

export default function AllProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState({});
  const { items, add, setQty, remove } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const list = await getProducts(); // ← now always an array
        setProducts(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      toast[updated[id] ? "success" : "info"](
        updated[id] ? "Item added to Wishlist" : "Item removed from Wishlist"
      );
      return updated;
    });
  };

  // AllProduct.jsx
  const buildCartItem = (p, qty = 1) => ({
    product: {
      id: String(p.id),
      name: p.medicine?.medicine_name ?? p.name ?? "Unknown",
      medicine: {
        price: p.medicine?.price ?? 0,
        image: p.medicine?.image ?? null, // ✅ add this
        weight: p.medicine?.weight ?? null, // optional
        units: p.medicine?.units ?? [], // optional
        medicine_name: p.medicine?.medicine_name ?? null,
      },
    },
    qty,
    selected: true,
    wish: false,
  });

  const decrease = (p) => {
    const key = String(p.id);
    const current = items?.[key]?.qty ?? 0;
    if (current > 1) {
      const next = current - 1;
      setQty(key, next);
      toast.info(`Decreased quantity to ${next}`);
    } else if (current === 1) {
      remove(key);
      toast.info("Removed from cart");
    } else {
      toast.info("Not in cart");
    }
  };

  const increase = async (p) => {
    const key = String(p.id);
    const current = items?.[key]?.qty ?? 0;
    if (current > 0) {
      const next = current + 1;
      await setQty(key, next);
      toast.success(`Increased quantity to ${next}`);
    } else {
      await add(buildCartItem(p, 1));
      toast.success("Added to cart");
    }
  };

  if (loading) return <p className="text-center py-10">Loading products...</p>;

  return (
    <div className="mb-12 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-md font-bold mb-6">Medicine</h1>
        <p className="mb-8">
          Reliable medical tools to support home and clinical care.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {(products ?? []).map((item) => {
            const pid = String(item.id);
            const qty = items?.[pid]?.qty ?? 0;
            const usdPrice = item.medicine?.price || 0;
            const khrPrice = usdPrice * EXCHANGE_RATE;
            const isWishlisted = wishlist[item.id] || false;

            return (
              <div
                key={pid}
                className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <button
                  onClick={() => toggleWishlist(item.id)}
                  className="absolute top-2 right-2 text-xl text-red-500"
                >
                  {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                </button>

                {/* FIXED typo: micine -> medicine */}
                <Link to={`/product-detail/${item.medicine?.id}`}>
                  <img
                    src={
                      item.medicine?.image ||
                      "https://via.placeholder.com/200x150"
                    }
                    alt={item.medicine?.medicine_name || "—"}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                </Link>

                <h2 className="text-md font-semibold text-green-500">
                  <Link to={`/product-detail/${item.medicine?.id}`}>
                    {item.medicine?.medicine_name}{" "}
                    {item.medicine?.weight ? `| ${item.medicine.weight}` : ""}
                  </Link>
                </h2>

                <p className="text-sm p-2 text-gray-600 dark:text-gray-300">
                  Type:{" "}
                  {(item.medicine?.units ?? [])
                    .map((u) => u.unit_name)
                    .join(", ")}
                </p>

                <p className="text-md text-gray-600 dark:text-gray-300">
                  {usdPrice
                    ? `$ ${usdPrice.toFixed(
                        2
                      )} | ៛ ${khrPrice.toLocaleString()}`
                    : "—"}
                </p>

                <div className="flex justify-center items-center gap-2 mt-3 border">
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
      </div>

      <ToastContainer position="top-left" autoClose={1000} />
    </div>
  );
}
