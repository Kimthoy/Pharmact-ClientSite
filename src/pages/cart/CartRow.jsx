import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaRegStar, FaStar, FaTrashAlt } from "react-icons/fa";

const EXCHANGE_RATE = 4100;
const clampInt = (n, min = 1, max = 9999) =>
  Math.min(max, Math.max(min, n | 0));
function formatKHR(n) {
  return `៛ ${Math.round(n).toLocaleString()}`;
}

export default function CartRow({
  item,
  onQty,
  onRemove,
  onToggleSelect,
  onToggleWish,
}) {
  // item: { id, qty, product: { name, medicine: { price } }, selected, wish }
  const { qty, product, selected, wish } = item || {};
  const med = product?.medicine ?? {};
  const id = product?.id != null ? String(product.id) : null;

  // 🔁 NEW: fallbacks so UI always shows something
  const name = med.medicine_name ?? product?.name ?? "—";
  const image = product.medicine?.image;
  const unitNames = med.units?.map((u) => u.unit_name).join(", ") || ""; // optional
  const desc = med.medicine_detail || ""; // optional
  const weight = med.weight || ""; // optional

  // We DO have price (we saved it in CartContext)
  const priceUSD = Number(med.price || 0);

  const oldUSD = priceUSD ? priceUSD * 1.04 : 0;
  const priceKHR = priceUSD * EXCHANGE_RATE;
  const oldKHR = oldUSD * EXCHANGE_RATE;

  const [draftQty, setDraftQty] = useState(() => clampInt(qty ?? 1));
  const timerRef = useRef(null);

  useEffect(() => {
    setDraftQty(clampInt(qty ?? 1));
  }, [qty]);

  const commitQty = (value) => {
    if (!id) return;
    const next = clampInt(value);
    setDraftQty(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onQty(id, next), 350);
  };

  const lineKHR = useMemo(() => draftQty * priceKHR, [draftQty, priceKHR]);

  return (
    <div
      className={`rounded border mb-4 ${selected ? "bg-white" : "bg-red-50"}`}
    >
      <div className="relative flex gap-3 p-3">
        {/* Wishlist star */}
        <button
          onClick={() => id && onToggleWish(id)}
          className="absolute left-2 top-2 text-gray-400 hover:text-yellow-400"
          title="Wishlist"
          disabled={!id}
        >
          {wish ? (
            <FaStar className="w-5 h-5" />
          ) : (
            <FaRegStar className="w-5 h-5" />
          )}
        </button>

        {/* Image */}
        <img
          src={image}
          alt={name}
          className="w-24 h-24 object-contain rounded border"
        />

        {/* Middle content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900">{name}</div>

          {/* badges (static for now) */}
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
              លក់អ្នកជំងឺ
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
              ដឹកជញ្ជូនគ្រួសារ
            </span>
          </div>

          {/* small description */}
          {(weight || desc) && (
            <div className="text-sm text-gray-600 mt-2 line-clamp-2">
              {weight && <span className="mr-1">{weight}</span>}
              {desc}
            </div>
          )}

          {/* unit line */}
          {unitNames && (
            <div className="text-xs text-gray-500 mt-1">{unitNames}</div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {/* price block */}
          <div className="text-right">
            {/* show USD too so users see both */}
            <div className="text-sm text-gray-600">${priceUSD.toFixed(2)}</div>
            <div className="text-green-600 font-semibold">
              {formatKHR(priceKHR)}
            </div>
            {oldUSD > 0 && (
              <div className="flex items-center gap-2 justify-end">
                <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-xs">
                  -4%
                </span>
                <span className="line-through text-gray-400 text-sm">
                  {formatKHR(oldKHR)}
                </span>
              </div>
            )}
            <div className="text-sm text-gray-700 mt-1">
              សរុប៖ <span className="font-semibold">{formatKHR(lineKHR)}</span>
            </div>
          </div>

          {/* qty controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => commitQty(draftQty - 1)}
              className="w-8 h-8 rounded-full text-2xl"
              aria-label="Decrease"
              disabled={!id || draftQty <= 1}
              title={draftQty <= 1 ? "Minimum 1" : "Decrease"}
            >
              −
            </button>

            <input
              className="w-16 h-8 text-center border rounded"
              value={draftQty}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                const v = raw === "" ? 1 : clampInt(parseInt(raw, 10));
                setDraftQty(v);
              }}
              onBlur={() => commitQty(draftQty)}
            />

            <button
              onClick={() => commitQty(draftQty + 1)}
              className="w-8 h-8 rounded-full text-black text-2xl"
              aria-label="Increase"
              disabled={!id}
            >
              +
            </button>

            <button
              onClick={() => {
                if (!id) return;
                if (
                  window.confirm("Are you sure you want to remove this item?")
                )
                  onRemove(id);
              }}
              className="ml-2 text-gray-400 hover:text-red-500"
              title="Remove"
              disabled={!id}
            >
              <FaTrashAlt />
            </button>

            <label className="ml-2 inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={!!selected}
                onChange={() => id && onToggleSelect(id)}
                disabled={!id}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
