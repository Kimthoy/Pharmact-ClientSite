import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FiUser, FiLock, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import authService from "../api/authService";

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  prefillPhone = "",
  infoMessage = "",
}) {
  const [phone, setPhone] = useState(prefillPhone);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loginValue, setLoginValue] = useState("");

  const canSubmit = useMemo(
    () => phone.trim() && password.length >= 6 && !loading,
    [phone, password, loading]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const { token, user } = await authService.login({
        login: phone.trim(), // <--- rename to "login"
        password,
        remember,
      });

      const storage = remember ? localStorage : sessionStorage;
      if (token) storage.setItem("token", token);
      if (user) localStorage.setItem("customer", JSON.stringify(user));

      onSuccess?.(user);
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.phone?.[0] ||
        err?.response?.data?.errors?.password?.[0] ||
        err?.message ||
        "មិនអាចចូលគណនីបានទេ។ សូមព្យាយាមម្តងទៀត!";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center p-4">
        <div
          className="relative w-full max-w-md mt-20 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
          style={{ maxHeight: "100vh" }}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b bg-white">
            <h2 className="text-xl font-bold">ចូលគណនី</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>

          <div className="px-5 pb-5 pt-4 overflow-y-auto max-h-[100vh]">
            {infoMessage && (
              <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm p-3">
                {infoMessage}
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm p-3">
                {errorMsg}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                  <FiUser />
                </div>
                <input
                  className="w-full rounded-xl border px-10 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="លេខទូរស័ព្ទ"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">
                  <FiLock />
                </div>
                <input
                  className="w-full rounded-xl border px-10 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="ពាក្យសម្ងាត់"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label="Toggle password"
                >
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <label className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>រក្សាទុកការចូលនេះ</span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full rounded-full py-3 font-semibold ${
                  canSubmit
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "cursor-not-allowed bg-gray-300 text-gray-600"
                }`}
              >
                {loading ? "កំពុងចូល..." : "ចូល"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
