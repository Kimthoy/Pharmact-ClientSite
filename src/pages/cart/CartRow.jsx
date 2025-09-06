// src/pages/cart/CartRow.jsx
import React from "react";
import { FiPlus, FiMinus, FiTrash2, FiHeart } from "react-icons/fi";

const EXCHANGE_RATE = 4100;

// Configure your public API base here (env preferred)
const API_BASE =
  import.meta?.env?.VITE_API_PUBLIC_BASE ||
  process.env.REACT_APP_API_PUBLIC_BASE ||
  window.location.origin;

const PLACEHOLDER = "https://via.placeholder.com/120x120?text=No+Image";

/** Normalize Laravel storage paths to absolute URLs */
function resolveImagePath(raw) {
  if (!raw || typeof raw !== "string") return PLACEHOLDER;

  // Already absolute
  if (/^https?:\/\//i.test(raw)) return raw;

  // Strip leading slashes
  let p = raw.replace(/^\/+/, "");

  // Common Laravel variants ➜ /storage/medicines/<file>
  if (p.startsWith("storage/app/public/")) {
    p = "storage/" + p.slice("storage/app/public/".length);
  } else if (p.startsWith("public/")) {
    p = "storage/" + p.slice("public/".length);
  } else if (p.startsWith("medicines/")) {
    p = "storage/" + p; // medicines/** -> storage/medicines/**
  }

  return `${API_BASE}/${p}`;
}

export default function CartRow({
  item,
  onQty,
  onRemove,
  onToggleSelect,
  onToggleWish,
}) {
  // Normalize the shape
  const product = item?.product ?? {
    id: String(item?.product_id ?? item?.id ?? ""),
    name: item?.name ?? item?.product_name ?? "Unknown",
    medicine: {
      id: String(item?.product_id ?? item?.id ?? ""),
      price: Number(item?.price_usd ?? item?.price ?? 0),
      image:
        item?.medicine?.image ||
        item?.product?.medicine?.image ||
        item?.product?.image ||
        item?.image ||
        null,
      weight: item?.weight ?? null,
      medicine_name: item?.medicine_name ?? item?.name ?? "Unknown",
      units: Array.isArray(item?.units) ? item.units : [],
    },
  };

  const med = product.medicine || {};
  const qty = Number(item?.qty ?? 1);
  const usd = Number(med?.price || 0);
  const khr = usd * EXCHANGE_RATE;

  const imageSrc = resolveImagePath(med?.image);

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border p-3">
      <img
        src={imageSrc}
        alt={med?.medicine_name || product?.name || "Product"}
        className="w-16 h-16 rounded border object-cover"
        onError={(e) => {
          if (e.currentTarget.src !== PLACEHOLDER) {
            e.currentTarget.src = PLACEHOLDER;
          }
        }}
      />

      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">
          {med?.medicine_name || product?.name}
        </div>
        <div className="text-xs text-gray-500">
          {med?.weight ? `Weight: ${med.weight}` : ""}
        </div>
      </div>

      <div className="text-right mr-2">
        <div className="text-emerald-600 font-semibold">
          ៛ {Math.round(khr).toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">$ {usd.toFixed(2)}</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 rounded-full border flex items-center justify-center"
          onClick={() => onQty?.(product.id, Math.max(qty - 1, 1))}
          title="-"
        >
          <FiMinus />
        </button>

        <div className="w-10 text-center">{qty}</div>

        <button
          className="w-8 h-8 rounded-full border flex items-center justify-center"
          onClick={() => onQty?.(product.id, qty + 1)}
          title="+"
        >
          <FiPlus />
        </button>

        <button
          className={`ml-2 ${
            item?.wish ? "text-pink-500" : "text-gray-500 hover:text-pink-500"
          }`}
          title="Wishlist"
          onClick={() => onToggleWish?.(product.id)}
        >
          <FiHeart />
        </button>

        <button
          className="text-gray-500 hover:text-red-600"
          title="Remove"
          onClick={() => onRemove?.(product.id)}
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
