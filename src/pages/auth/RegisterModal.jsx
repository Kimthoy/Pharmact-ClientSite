// src/pages/auth/RegisterModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiLock,
  FiEye,
  FiEyeOff,
  FiX,
} from "react-icons/fi";
import authService from "../api/authService";

const PROVINCES = [
  "ភ្នំពេញ",
  "កណ្ដាល",
  "តាកែវ",
  "កំពង់ស្ពឺ",
  "កំពង់ចាម",
  "បាត់ដំបង",
  "ព្រះសីហនុ",
];
const GENDERS = [
  { value: "male", label: "ប្រុស" },
  { value: "female", label: "ស្រី" },
];

export default function RegisterModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    province: "កណ្ដាល",
    address: "",
   
    occupation: "និស្សិត",
    acceptTerms: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const sheetRef = useRef(null);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // click outside to close
  const onBackdropClick = (e) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target)) onClose?.();
  };

  const onChange = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const mismatch = useMemo(
    () => form.password && form.confirm && form.password !== form.confirm,
    [form.password, form.confirm]
  );

  const canSubmit = useMemo(
    () =>
      form.name.trim() &&
      form.phone.trim() &&
      form.password.length >= 6 &&
      !mismatch &&
    
      form.province &&
      form.acceptTerms &&
      !submitting,
    [form, mismatch, submitting]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        password: form.password,
        password_confirmation: form.confirm,
        province: form.province,
        address: form.address.trim(),
       
        occupation: form.occupation || null,
      };

      await authService.register(payload);

      onSuccess?.();
      onClose?.();
      navigate("/login", {
        replace: true,
        state: { registered: true, phone: form.phone },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.password?.[0] ||
        err?.message ||
        "មានបញ្ហាក្នុងការបង្កើតគណនី។ សូមព្យាយាមម្ដងទៀត!";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onMouseDown={onBackdropClick}
      />

      {/* Center wrapper */}
      <div className="absolute inset-0 flex items-start justify-center p-4">
        {/* Sheet */}
        <div
          ref={sheetRef}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
          style={{ maxHeight: "90vh" }} // ensure whole sheet never exceeds viewport
        >
          {/* Sticky header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b bg-white">
            <h2 className="text-xl font-bold">បង្កើតគណនី</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="px-5 pb-5 pt-4 overflow-y-auto max-h-[80vh]">
            <form onSubmit={submit} className="space-y-3">
              {/* Name */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                  <FiUser />
                </div>
                <input
                  className="w-full rounded-xl border px-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ឈ្មោះពេញ *"
                  value={form.name}
                  onChange={onChange("name")}
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                  <FiPhone />
                </div>
                <input
                  className="w-full rounded-xl border px-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="លេខទូរស័ព្ទ *"
                  value={form.phone}
                  onChange={onChange("phone")}
                  inputMode="tel"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                  <FiMail />
                </div>
                <input
                  className="w-full rounded-xl border px-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="អ៊ីមែល (ជាជម្រើស)"
                  value={form.email}
                  onChange={onChange("email")}
                  type="email"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                  <FiLock />
                </div>
                <input
                  className="w-full rounded-xl border px-10 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ពាក្យសម្ងាត់ *"
                  value={form.password}
                  onChange={onChange("password")}
                  type={showPass ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label="Toggle password"
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
                <p className="mt-1 text-xs text-gray-500">
                  ត្រូវការយ៉ាងតិច 6 តួអក្សរ
                </p>
              </div>

              {/* Confirm password */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                  <FiLock />
                </div>
                <input
                  className={`w-full rounded-xl border px-10 py-3 pr-12 focus:outline-none focus:ring-2 ${
                    mismatch
                      ? "border-red-400 focus:ring-red-500"
                      : "focus:ring-emerald-500"
                  }`}
                  placeholder="បញ្ជាក់ពាក្យសម្ងាត់ *"
                  value={form.confirm}
                  onChange={onChange("confirm")}
                  type={showConfirm ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label="Toggle confirm password"
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
                {mismatch && (
                  <div className="mt-1 text-xs text-red-600">
                    ពាក្យសម្ងាត់មិនដូចគ្នាទេ (The password confirmation does not
                    match)
                  </div>
                )}
              </div>

              {/* Province */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                  <FiMapPin />
                </div>
                <select
                  className="w-full appearance-none rounded-xl border bg-white px-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={form.province}
                  onChange={onChange("province")}
                >
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                  <FiMapPin />
                </div>
                <input
                  className="w-full rounded-xl border px-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="អាសយដ្ឋានលម្អិត (ផ្ទះ, ផ្លូវ, ឃុំ/សង្កាត់...)"
                  value={form.address}
                  onChange={onChange("address")}
                />
              </div>

            

              {/* Occupation */}
              <div className="mt-2">
                <div className="mb-1 text-sm text-gray-700">មុខរបរ</div>
                <input
                  className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ឧ. និស្សិត / គ្រូពេទ្យ / បុគ្គលិក"
                  value={form.occupation}
                  onChange={onChange("occupation")}
                />
              </div>

              {/* Terms */}
              <label className="mt-2 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={onChange("acceptTerms")}
                />
                <span>
                  យល់ព្រមនឹងលក្ខខណ្ឌនានា និង{" "}
                  <span className="text-emerald-700 underline">
                    គោលការណ៍​ភាពឯកជន
                  </span>
                </span>
              </label>

              {/* Errors */}
              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`mt-2 w-full rounded-full py-3 font-semibold ${
                  canSubmit
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "cursor-not-allowed bg-gray-300 text-gray-600"
                }`}
              >
                {submitting ? "កំពុងបង្កើត…" : "បង្កើតគណនីថ្មី"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
