// src/pages/cart/CartPage.jsx
import React, { useMemo } from "react";
import { useCart } from "../../context/CartContext";
import CartRow from "./CartRow";
import CartSummary from "./CartSummary";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const navigate = useNavigate();
  const { items, setQty, remove, toggleSelect, toggleWish } = useCart();

  const list = useMemo(
    () => Object.entries(items).map(([id, it]) => ({ id, ...it })),
    [items]
  );

  if (list.length === 0) {
    return <div className="p-6 text-center">កន្រ្តកទំនិញទទេ 🛒</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">ថ្នាំដែលបានបន្ថែមចូល</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-2 space-y-4">
          {list.map((it) => (
            <CartRow
              key={it.id}
              item={it}
              onQty={(id, q) => setQty(String(id), q)}
              onRemove={(id) => remove(String(id))}
              onToggleSelect={(id) => toggleSelect(String(id))}
              onToggleWish={(id) => toggleWish(String(id))}
            />
          ))}
        </div>

        <aside className="md:col-span-1 md:sticky md:top-4 self-start h-fit">
          <CartSummary onCheckout={() => navigate("/checkout")} />
        </aside>
      </div>
    </div>
  );
}
