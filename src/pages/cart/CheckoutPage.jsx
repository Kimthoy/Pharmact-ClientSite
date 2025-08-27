import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CartSummary from "../cart/CartSummary";
import orderService from "../api/orderService";
import cartService from "../api/cartService"; // used to clear cart after success

// dummy options (replace with data from backend when ready)
const provinces = ["កណ្ដាល", "ភ្នំពេញ", "តាកែវ", "កំពង់ស្ពឺ"];
const districts = ["ក្រុង/ស្រុក A", "ក្រុង/ស្រុក B", "ក្រុង/ស្រុក C"];
const communes = ["ឃុំ/សង្កាត់ A", "ឃុំ/សង្កាត់ B", "ឃុំ/សង្កាត់ C"];
const villages = ["ភូមិ A", "ភូមិ B", "ភូមិ C"];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items } = useCart();

  const selectedLines = useMemo(
    () => Object.values(items || {}).filter((it) => it?.selected),
    [items]
  );

  // form state
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

    // delivery & payment
    deliverySlot: "24h",
    paymentMethod: "cod", // 'cod' | 'aba_qr' | 'khqr'
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const onChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const placeOrder = async () => {
    if (selectedLines.length === 0) {
      alert("Cart empty or nothing selected.");
      return;
    }

    try {
      setSubmitting(true);

      // snapshot cart lines -> API items
      const itemsPayload = selectedLines.map((l) => ({
        product_id: String(l?.product?.id),
        name:
          l?.product?.name ?? l?.product?.medicine?.medicine_name ?? "Unknown",
        price_usd: Number(l?.product?.medicine?.price ?? 0),
        qty: Number(l?.qty ?? 1),
      }));

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
        payment_method: form.paymentMethod, // "cod" | "aba_qr" | "khqr"
        delivery_slot: form.deliverySlot, // e.g., "24h"
        note: form.note || null,
        items: itemsPayload,
      };

      const order = await orderService.create(payload);

      // optional: clear cart and navigate
      try {
        await cartService.clearCart();
      } catch {}
      alert(`Order #${order.id} created ✓`);
      navigate("/"); // or navigate(`/order-success/${order.id}`)
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
        {/* LEFT: form column */}
        <div className="md:col-span-2 space-y-4">
          {/* Customer info card */}
          <section className="bg-white border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">កំណត់ព័ត៌មានទទួល</h2>
              <button type="button" className="text-emerald-600 text-sm">
                ប្រើពីគណនីអ្នកប្រើ
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm text-gray-600">ឈ្មោះ * </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={form.full_name}
                  onChange={onChange("full_name")}
                  placeholder="Full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">លេខទូរស័ព្ទ *</label>
                  <input
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={form.phone}
                    onChange={onChange("phone")}
                    placeholder="0xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={form.email}
                    onChange={onChange("email")}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  អាសយដ្ឋាន / លម្អិត *
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={form.address}
                  onChange={onChange("address")}
                  placeholder="ផ្ទះលេខ, ផ្លូវ, ចំណាំជិតខាង..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600">
                    ខេត្ត/រាជធានី *
                  </label>
                  <select
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={form.province}
                    onChange={onChange("province")}
                  >
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">
                    ក្រុង/ស្រុក/ខណ្ឌ *
                  </label>
                  <select
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={form.district}
                    onChange={onChange("district")}
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">ឃុំ/សង្កាត់ *</label>
                  <select
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    value={form.commune}
                    onChange={onChange("commune")}
                  >
                    {communes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">ភូមិ *</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={form.village}
                  onChange={onChange("village")}
                >
                  {villages.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

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

          {/* Delivery slot card */}
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

          {/* Payment methods card */}
          <section className="bg-white border rounded-2xl p-4">
            <h2 className="font-semibold mb-3">បង់ប្រាក់ជម្រើស</h2>

            <div className="space-y-2">
              <label className="flex items-center gap-3 border rounded-xl px-3 py-3">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={form.paymentMethod === "cod"}
                  onChange={onChange("paymentMethod")}
                />
                <div className="flex-1">
                  <div className="font-medium">គិតប្រាក់ពេលដឹកជញ្ជូន</div>
                  <div className="text-xs text-gray-500">
                    បង់ប្រាក់ជាសាច់ប្រាក់ពេលទទួល
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 border rounded-xl px-3 py-3">
                <input
                  type="radio"
                  name="payment"
                  value="aba_qr"
                  checked={form.paymentMethod === "aba_qr"}
                  onChange={onChange("paymentMethod")}
                />
                <div className="flex-1">
                  <div className="font-medium">ABA KHQR</div>
                  <div className="text-xs text-gray-500">គិតថ្លៃសេវា 0.5%</div>
                </div>
              </label>

              <label className="flex items-center gap-3 border rounded-xl px-3 py-3">
                <input
                  type="radio"
                  name="payment"
                  value="khqr"
                  checked={form.paymentMethod === "khqr"}
                  onChange={onChange("paymentMethod")}
                />
                <div className="flex-1">
                  <div className="font-medium">KHQR</div>
                  <div className="text-xs text-gray-500">គិតថ្លៃសេវា 0.5%</div>
                </div>
              </label>
            </div>
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

        {/* RIGHT: summary column */}
        <aside className="md:col-span-1 md:sticky md:top-4 self-start h-fit">
          <CartSummary
            paymentMethod={form.paymentMethod} // for KHQR/ABA-QR -0.5% line
            onCheckout={placeOrder}
            loading={submitting}
          />
        </aside>
      </div>
    </div>
  );
}
