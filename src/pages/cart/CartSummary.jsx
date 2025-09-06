// src/pages/cart/CartSummary.jsx
import React, { useMemo, useState } from "react";
import { useCart } from "../../context/CartContext";

const DEFAULT_RATE = 4100;
const MIN_ORDER_KHR = 1000;

const round100 = (n) => Math.round(n / 100) * 100;
const fmtKHR = (n) => `៛ ${Math.round(n).toLocaleString()}`;
const fmtUSD = (n) => `$ ${n.toFixed(2)}`;

// map of payment method → rate (negative = discount, positive = fee)
const PAYMENT_RATES = {
  cod: 0,
  aba_qr: -0.005, // -0.5%
  khqr: -0.005, // -0.5%
};

// --- helpers to tolerate both client + backend cart shapes ---
function getSelected(list) {
  // default selected=true when undefined (matches typical UI)
  return (list || []).filter((it) => (it?.selected ?? true) === true);
}
function getQty(it) {
  return Number(it?.qty ?? 1);
}
function getPriceUSD(it) {
  // Prefer nested (frontend) → fallback to flat (backend)
  return Number(
    it?.product?.medicine?.price ??
      it?.product?.price ?? // if you ever store price on product directly
      it?.price_usd ?? // backend
      it?.price ?? // any other alias
      0
  );
}

export default function CartSummary({
  onCheckout,
  paymentMethod = "cod",
  shippingKHR: shippingProp = 0,
  couponKHR: couponProp = 0,
  exchangeRate = DEFAULT_RATE,
}) {
  const { items, countQty } = useCart();

  const {
    itemCount,
    subtotalKHR,
    shippingKHR,
    couponKHR,
    payAdjKHR,
    totalKHR,
  } = useMemo(() => {
    const list = getSelected(Object.values(items || {}));

    const itemCount = list.reduce((s, it) => s + getQty(it), 0);

    const subtotalKHR = list.reduce((sum, it) => {
      const priceUSD = getPriceUSD(it);
      return sum + priceUSD * exchangeRate * getQty(it);
    }, 0);

    const shippingKHR = round100(shippingProp || 0);
    const couponKHR = round100(-Math.abs(couponProp || 0)); // coupons show as negative

    const rate = PAYMENT_RATES[paymentMethod] ?? 0;
    const payAdjKHR = round100(subtotalKHR * rate);

    const totalKHR = Math.max(
      subtotalKHR + shippingKHR + couponKHR + payAdjKHR,
      0
    );

    return {
      itemCount,
      subtotalKHR,
      shippingKHR,
      couponKHR,
      payAdjKHR,
      totalKHR,
    };
  }, [items, paymentMethod, shippingProp, couponProp, exchangeRate]);

  const subtotalUSD = subtotalKHR / exchangeRate;
  const totalUSD = totalKHR / exchangeRate;

  const belowMin = totalKHR > 0 && totalKHR < MIN_ORDER_KHR;

  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const pmLabel =
    paymentMethod === "aba_qr"
      ? "ABA KHQR (បញ្ចុះ 0.5%)"
      : paymentMethod === "khqr"
      ? "KHQR (បញ្ចុះ 0.5%)"
      : "គិតប្រាក់ពេលដឹកជញ្ជូន";

  return (
    <aside className="bg-white rounded-2xl shadow p-4 border">
      {/* Header (items) */}
      <div className="flex items-center justify-between text-[15px]">
        <span className="text-gray-700">ចំនួន</span>
        <span className="font-medium">{itemCount || countQty || 0}</span>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between mt-3 text-[15px]">
        <span className="text-gray-700">សរុបរង</span>
        <div className="text-right">
          <div className="font-semibold">{fmtKHR(subtotalKHR)}</div>
          <div className="text-xs text-gray-500">{fmtUSD(subtotalUSD)}</div>
        </div>
      </div>

      {/* Shipping */}
      <div className="flex items-center justify-between mt-3 text-[15px] text-gray-500">
        <span>ដឹកជញ្ជូន</span>
        <span>{fmtKHR(shippingKHR)}</span>
      </div>

      {/* Payment method adjustment */}
      {!!payAdjKHR && (
        <div className="flex items-center justify-between mt-2 text-[15px] text-gray-500">
          <span>{pmLabel}</span>
          <span
            className={payAdjKHR < 0 ? "text-emerald-600" : "text-gray-700"}
          >
            {fmtKHR(payAdjKHR)}
          </span>
        </div>
      )}

      {/* Coupon */}
      {!!couponKHR && (
        <div className="flex items-center justify-between mt-2 text-[15px] text-gray-500">
          <span>បញ្ចុះតម្លៃ</span>
          <span className="text-emerald-600">{fmtKHR(couponKHR)}</span>
        </div>
      )}

      <div className="my-3 h-px bg-gray-200" />

      {/* Grand total */}
      <div className="flex items-center justify-between">
        <span className="text-gray-700 font-medium">សរុបចុងក្រោយ</span>
        <div className="text-right">
          <div className="text-emerald-600 font-bold">{fmtKHR(totalKHR)}</div>
          <div className="text-xs text-gray-500">{fmtUSD(totalUSD)}</div>
        </div>
      </div>

      {/* Optional coupon UI */}
      <div className="mt-3">
        <button
          onClick={() => setShowCoupon((v) => !v)}
          className="w-full text-left px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
        >
          ប្រើសំបុត្របញ្ចុះតម្លៃ
        </button>
        {showCoupon && (
          <div className="mt-2 flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="កូដបញ្ចុះតម្លៃ"
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <button
              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600"
              onClick={() => alert("Apply coupon: call your backend here")}
            >
              អនុវត្ត
            </button>
          </div>
        )}
      </div>

      {belowMin && (
        <p className="mt-2 text-xs text-red-600">
          បញ្ជាក់៖ ការបញ្ជាទិញត្រូវមានសរុបមិនតិចជាង {fmtKHR(MIN_ORDER_KHR)}
        </p>
      )}

      <button
        disabled={totalKHR <= 0 || belowMin}
        onClick={onCheckout}
        className={`mt-4 w-full rounded-full py-3 font-semibold ${
          totalKHR <= 0 || belowMin
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        បន្តទៅការទូទាត់
      </button>
    </aside>
  );
}
