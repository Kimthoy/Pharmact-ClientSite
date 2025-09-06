// src/pages/checkout/CheckoutPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartSummary from "../cart/CartSummary";
import orderService from "../api/orderService";
import cartService from "../api/cartService"; // to clear cart after success

// TODO: Replace dummy data with API options
const provinces = ["កណ្ដាល", "ភ្នំពេញ", "តាកែវ", "កំពង់ស្ពឺ"];
const districts = ["ក្រុង/ស្រុក A", "ក្រុង/ស្រុក B", "ក្រុង/ស្រុក C"];
const communes = ["ឃុំ/សង្កាត់ A", "ឃុំ/សង្កាត់ B", "ឃុំ/សង្កាត់ C"];
const villages = ["ភូមិ A", "ភូមិ B", "ភូមិ C"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items } = useCart();

  // only selected lines
  const selectedLines = useMemo(
    () => Object.values(items || {}).filter((it) => it?.selected),
    [items]
  );

  const [form, setForm] = useState({
    full_name: "Khoy Rathanak",
    phone: "060776402",
    email: "",
    address: "",
    province: "កណ្ដាល",
    district: "ក្រុង/ស្រុក A",
    commune: "ឃុំ/សង្កាត់ A",
    village: "ភូមិ A",
    saveDefault: true,
    deliverySlot: "24h",
    paymentMethod: "cod",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const onChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // normalize cart line to backend payload
  const normalizeItem = (line) => {
    const productId =
      line?.product_id || line?.product?.id || line?.product?.medicine?.id;

    const name =
      line?.name ||
      line?.product?.name ||
      line?.product?.medicine?.medicine_name ||
      "Unknown";

    const price =
      Number(line?.price_usd) ||
      Number(line?.price) ||
      Number(line?.product?.medicine?.price ?? 0);

    const qty = Number(line?.qty ?? 1);

    return {
      product_id: String(productId),
      name,
      price_usd: price,
      qty,
    };
  };

  const placeOrder = async () => {
    if (selectedLines.length === 0) {
      alert("Cart empty or nothing selected.");
      return;
    }

    try {
      setSubmitting(true);

      const itemsPayload = selectedLines.map(normalizeItem);

      const payload = {
        customer: {
          full_name: form.full_name,
          phone: form.phone,
          email: form.email || null,
          address: form.address,
          province: form.province,
          district: form.district,
          commune: form.commune,
          village: form.village,
          save_default: !!form.saveDefault,
        },
        payment_method: form.paymentMethod,
        delivery_slot: form.deliverySlot,
        note: form.note || null,
        items: itemsPayload,
      };

      const order = await orderService.create(payload);

      // clear cart after order success
      try {
        await cartService.clearCart();
      } catch (e) {
        console.warn("Failed to clear cart:", e);
      }

      alert(`Order #${order.id} created ✓`);
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        JSON.stringify(err?.response?.data?.errors || {}) ||
        "Failed to place order";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button className="mb-4 text-emerald-600" onClick={() => navigate(-1)}>
        ← ត្រឡប់ក្រោយ
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* LEFT: form */}
        <div className="md:col-span-2 space-y-4">
          {/* Customer info */}
          <section className="bg-white border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">កំណត់ព័ត៌មានទទួល</h2>
              <button type="button" className="text-emerald-600 text-sm">
                ប្រើពីគណនីអ្នកប្រើ
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Name */}
              <div>
                <label className="text-sm text-gray-600">ឈ្មោះ *</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={form.full_name}
                  onChange={onChange("full_name")}
                />
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">លេខទូរស័ព្ទ *</label>
                  <input
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={form.phone}
                    onChange={onChange("phone")}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={form.email}
                    onChange={onChange("email")}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-sm text-gray-600">
                  អាសយដ្ឋាន / លម្អិត *
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={form.address}
                  onChange={onChange("address")}
                />
              </div>

              {/* Province / District / Commune */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={form.province}
                  onChange={onChange("province")}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  {provinces.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <select
                  value={form.district}
                  onChange={onChange("district")}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={form.commune}
                  onChange={onChange("commune")}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  {communes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Village */}
              <select
                value={form.village}
                onChange={onChange("village")}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {villages.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={form.saveDefault}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, saveDefault: e.target.checked }))
                  }
                />
                <span className="text-sm text-gray-700">
                  រក្សាទុកជាអាសយដ្ឋានលំនាំដើម
                </span>
              </label>
            </div>
          </section>

          {/* Delivery slot */}
          <section className="bg-white border rounded-2xl p-4">
            <h2 className="font-semibold mb-3">មជ្ឈមណ្ឌលដឹកជញ្ជូន</h2>
            <label className="flex items-center gap-3 border rounded-xl px-3 py-3">
              <input
                type="radio"
                name="deliverySlot"
                value="24h"
                checked={form.deliverySlot === "24h"}
                onChange={onChange("deliverySlot")}
              />
              <div className="flex-1">
                <div className="font-medium">ដឹកជញ្ជូនសរុក (24ម៉ោង)</div>
                <div className="text-xs text-gray-500">
                  ដឹកជញ្ជូនឆាប់រហ័ស នៅខណ្ឌ/ស្រុកជាប់ខាង
                </div>
              </div>
            </label>
          </section>

          {/* Payment methods */}
          <section className="bg-white border rounded-2xl p-4">
            <h2 className="font-semibold mb-3">បង់ប្រាក់ជម្រើស</h2>
            {[
              {
                value: "cod",
                label: "គិតប្រាក់ពេលដឹកជញ្ជូន",
                desc: "បង់ប្រាក់ជាសាច់ប្រាក់ពេលទទួល",
              },
              { value: "aba_qr", label: "ABA KHQR", desc: "គិតថ្លៃសេវា 0.5%" },
              { value: "khqr", label: "KHQR", desc: "គិតថ្លៃសេវា 0.5%" },
            ].map((pm) => (
              <label
                key={pm.value}
                className="flex items-center gap-3 border rounded-xl px-3 py-3"
              >
                <input
                  type="radio"
                  name="payment"
                  value={pm.value}
                  checked={form.paymentMethod === pm.value}
                  onChange={onChange("paymentMethod")}
                />
                <div className="flex-1">
                  <div className="font-medium">{pm.label}</div>
                  <div className="text-xs text-gray-500">{pm.desc}</div>
                </div>
              </label>
            ))}
          </section>

          {/* Note */}
          <section className="bg-white border rounded-2xl p-4">
            <h2 className="font-semibold mb-2">កំណត់ចំណាំ</h2>
            <textarea
              rows={4}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="សូមបញ្ចាក់ព័ត៌មានបន្ថែម ប្រសិនបើមាន…"
              value={form.note}
              onChange={onChange("note")}
            />
          </section>
        </div>

        {/* RIGHT: summary */}
        <aside className="md:col-span-1 md:sticky md:top-4 self-start h-fit">
          <CartSummary
            paymentMethod={form.paymentMethod}
            onCheckout={placeOrder}
            loading={submitting}
          />
        </aside>
      </div>
    </div>
  );
}
