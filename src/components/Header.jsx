// src/components/Header.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { FiShoppingCart, FiHeart, FiBell, FiCheck } from "react-icons/fi";

import { useCart } from "../context/CartContext";
import {
  getAlerts,
  markRead,
  markAllRead,
} from "../pages/api/notificationService";
import RegisterModal from "../pages/auth/RegisterModal";
import Login from "../pages/auth/Login";
import authService from "../pages/api/authService";
import { getCategories } from "../pages/api/categoryService";

const WKEY = "wishlist";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("customer")) || null;
  } catch {
    return null;
  }
}

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // ✅ cart context
  const { items, cartCount, wishCount, refresh: refreshCart } = useCart();

  // --- auth state ---
  const [user, setUser] = useState(readUser());
  const isAuthed = !!(user?.id || user?.name || user?.phone || user?.email);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "customer" || e.key === "token") setUser(readUser());
      if (e.key === WKEY) window.dispatchEvent(new Event("wishlist:changed"));
    };
    const onAuth = () => setUser(readUser());
    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed", onAuth);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed", onAuth);
    };
  }, []);

  // --- profile & bell popovers ---
  const [openProfile, setOpenProfile] = useState(false);
  const [openBell, setOpenBell] = useState(false);
  const profileRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (
        openProfile &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      )
        setOpenProfile(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openProfile]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!openBell) return;
      if (bellRef.current && !bellRef.current.contains(e.target))
        setOpenBell(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpenBell(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [openBell]);

  // --- logout ---
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("customer");
    localStorage.setItem(WKEY, "[]");
    window.dispatchEvent(new Event("auth:changed"));
    window.dispatchEvent(new Event("wishlist:changed"));
    setUser(null);
    refreshCart();
    setOpenProfile(false);
    setOpenBell(false);
    setConfirmLogoutOpen(false);
    navigate("/logout");
  };

  // --- register/login modals ---
  const [regOpen, setRegOpen] = useState(false);
  const [logInOpen, setLogInOpen] = useState(false);

  // --- wishlist badge (cart wishes + localStorage) ---
  const [wishLocal, setWishLocal] = useState(0);
  useEffect(() => {
    const readLocal = () => {
      try {
        const arr = JSON.parse(localStorage.getItem(WKEY)) || [];
        setWishLocal(Array.isArray(arr) ? arr.length : 0);
      } catch {
        setWishLocal(0);
      }
    };
    readLocal();
    const onStorage = (e) => e.key === WKEY && readLocal();
    const onChanged = () => readLocal();
    const onFocus = () => readLocal();
    window.addEventListener("storage", onStorage);
    window.addEventListener("wishlist:changed", onChanged);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("wishlist:changed", onChanged);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  const wishBadge = wishCount + wishLocal;

  // --- notifications ---
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [errorAlerts, setErrorAlerts] = useState(null);
  const unreadCount = useMemo(
    () => alerts.filter((a) => !a.read_at).length,
    [alerts]
  );

  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    setErrorAlerts(null);
    try {
      const list = await getAlerts();
      setAlerts(Array.isArray(list) ? list : []);
    } catch (e) {
      setErrorAlerts("Failed to load notifications");
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (!isAuthed) {
      setAlerts([]);
      setErrorAlerts(null);
      return;
    }
    fetchAlerts();
    const id = setInterval(fetchAlerts, 30000);
    const onFocus = () => fetchAlerts();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [isAuthed]);

  const onBellClick = async () => {
    const next = !openBell;
    setOpenBell(next);
    if (next && isAuthed) await fetchAlerts();
  };
  const onMarkAll = async () => {
    if (!unreadCount) return;
    await markAllRead();
    await fetchAlerts();
  };
  const onMarkOne = async (id) => {
    await markRead(id);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, read_at: new Date().toISOString() } : a
      )
    );
  };

  // --- categories & search ---
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState(null);
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const [searchText, setSearchText] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const load = async () => {
      setCatLoading(true);
      setCatError(null);
      try {
        const list = await getCategories();
        setCategories(Array.isArray(list) ? list : []);
      } catch (e) {
        setCatError("Failed to load categories");
      } finally {
        setCatLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => setSearchText(initialSearch), [initialSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => {
    if (pathname !== "/product") return;
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    const qs = params.toString();
    navigate(`/product${qs ? `?${qs}` : ""}`, { replace: true });
  }, [debouncedSearch, selectedCategory, pathname, navigate]);

  const initials =
    (user?.username || user?.name || "U")[0]?.toUpperCase?.() || "U";

  return (
    <>
      <header className="sticky top-0 z-[55] shadow-md">
        {/* Top bar */}
        <div className="bg-green-600 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Pharmacy"
                className="w-11 h-11 rounded-full"
              />
              <h1 className="text-xl font-bold text-white">
                Panharith Pharmacy
              </h1>
            </Link>

            <div className="flex items-center gap-4 relative">
              {!isAuthed ? (
                <>
                  <button
                    className="px-3 h-10 rounded-lg bg-white text-green-600 text-sm"
                    onClick={() => setRegOpen(true)}
                  >
                    Register
                  </button>
                  <button
                    className="px-3 h-10 rounded-lg bg-white text-green-600 text-sm"
                    onClick={() => setLogInOpen(true)}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  {/* Search */}
                  <div className="flex items-center h-10 rounded-lg border border-green-200 bg-white dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSearchText(v);
                        if (pathname !== "/product") {
                          const params = new URLSearchParams();
                          if (selectedCategory)
                            params.set("category", selectedCategory);
                          if (v.trim()) params.set("search", v.trim());
                          navigate(
                            `/product${params.toString() ? `?${params}` : ""}`
                          );
                        }
                      }}
                      placeholder="ស្វែងរកឈ្មោះថ្នាំ…"
                      className="px-3 h-full bg-transparent outline-none text-sm text-green-900 dark:text-white placeholder:opacity-70"
                    />
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={bellRef}>
                    <button
                      className="relative w-10 h-10 flex items-center justify-center text-white"
                      onClick={onBellClick}
                      aria-label="Notifications"
                    >
                      <FiBell className="w-6 h-6 hover:scale-110 transition-all hover:animate-pulse" />
                      {unreadCount > 0 && (
                        <div className="absolute -top-3 -right-3 bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                          {unreadCount}
                        </div>
                      )}
                    </button>

                    {openBell && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg z-[999]">
                        <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-700">
                          <div className="font-semibold">ការជូនដំណឹង</div>
                          <button
                            className={`text-xs flex items-center gap-1 ${
                              unreadCount
                                ? "text-emerald-600 hover:underline"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                            onClick={onMarkAll}
                            disabled={!unreadCount}
                          >
                            <FiCheck className="hover:scale-110 transition-all hover:animate-pulse" />{" "}
                            អានរួចទាំងអស់
                          </button>
                        </div>

                        <div className="max-h-80 overflow-auto">
                          {loadingAlerts ? (
                            <div className="px-3 py-4 text-sm text-gray-500">
                              កំពុងផ្ទុក…
                            </div>
                          ) : errorAlerts ? (
                            <div className="px-3 py-4 text-sm text-red-600">
                              {errorAlerts}
                            </div>
                          ) : alerts.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-gray-500">
                              គ្មានដំណឹងថ្មីទេ
                            </div>
                          ) : (
                            alerts.map((a) => (
                              <div
                                key={a.id}
                                className={`px-3 py-3 text-sm border-b dark:border-gray-700 ${
                                  a.read_at
                                    ? "bg-white dark:bg-gray-800"
                                    : "bg-amber-50 dark:bg-gray-700/40"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {!a.read_at && (
                                    <span className="mt-1 inline-block w-2 h-2 rounded-full bg-amber-500" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">
                                      {a.title ?? "Notification"}
                                    </div>
                                    {a.body && (
                                      <div className="text-gray-600 dark:text-gray-300 mt-0.5">
                                        {a.body}
                                      </div>
                                    )}
                                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                                      <span>
                                        {new Date(
                                          a.created_at ||
                                            a.published_at ||
                                            Date.now()
                                        ).toLocaleString()}
                                      </span>
                                      {!a.read_at && (
                                        <button
                                          className="text-emerald-600 hover:underline"
                                          onClick={() => onMarkOne(a.id)}
                                        >
                                          អានរួច
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Wishlist */}
                  <Link
                    to="/wishlist"
                    className="relative w-10 h-10 flex items-center justify-center text-white"
                    aria-label="Wishlist"
                    onClick={() => {
                      setOpenBell(false);
                      setOpenProfile(false);
                    }}
                  >
                    <FiHeart className="w-6 h-6 hover:scale-110 transition-all hover:animate-pulse" />
                    {wishBadge > 0 && (
                      <div className="absolute -top-1 -right-1 text-whit rounded-full w-4 h-4 flex items-center justify-center text-md font-semibold">
                        {wishBadge}
                      </div>
                    )}
                  </Link>

                  {/* Cart */}
                  <Link
                    to="/cart"
                    className="relative w-10 h-10 flex items-center justify-center text-white"
                    aria-label="Cart"
                    onClick={() => {
                      setOpenBell(false);
                      setOpenProfile(false);
                    }}
                  >
                    <FiShoppingCart className="w-6 h-6 hover:scale-110 transition-all hover:animate-pulse" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 font-semibold text-white text-md w-4 h-4 rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Profile */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setOpenProfile((v) => !v)}
                      className="p-6 w-10 h-10 rounded-full bg-white text-green-700 font-bold flex items-center justify-center"
                      aria-label="Profile menu"
                      title={user?.username || user?.phone}
                    >
                      {initials}
                    </button>

                    {openProfile && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border rounded-xl shadow-lg z-[999]">
                        <div className="px-3 py-2 space-y-2 text-left border-b uppercase">
                          <div className="text-sm">user: {user?.username}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {user?.phone || user?.email}
                          </div>
                        </div>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                          onClick={() => {
                            setOpenProfile(false);
                            navigate("/account");
                          }}
                        >
                          ប្រូហ្វាល់
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                          onClick={() => {
                            setOpenProfile(false);
                            navigate("/orders");
                          }}
                        >
                          ការកម្មង់
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 hover:rounded-lg"
                          onClick={() => {
                            setOpenProfile(false);
                            setConfirmLogoutOpen(true);
                          }}
                        >
                          ចេញពីគណនី
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sub-navbar */}
        {isAuthed && (
          <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
              <div className="flex space-x-6">
                <Link
                  to="/"
                  className="text-green-800 py-3 block hover:underline"
                >
                  ផលិតផល
                </Link>
                <Link
                  to="/product"
                  className="text-green-800 py-3 block hover:underline"
                >
                  បញ្ជារទិញរហ័ស
                </Link>
                <a
                  href="#contact"
                  className="text-green-800 py-3 block hover:underline"
                >
                  ទំនាក់ទំនង
                </a>
              </div>
              <CategoryFilter />
            </div>
          </nav>
        )}
      </header>

      {/* Register/Login Modals */}
      <RegisterModal
        isOpen={regOpen}
        onClose={() => setRegOpen(false)}
        onSuccess={() => {
          setRegOpen(false);
          setLogInOpen(true);
        }}
      />
      <Login
        isOpen={logInOpen}
        onClose={() => setLogInOpen(false)}
        onSuccess={(u) => {
          setUser(u || readUser());
          window.dispatchEvent(new Event("auth:changed"));
          refreshCart();
          setLogInOpen(false);
          navigate("/dashboard");
        }}
      />

      {/* Logout Confirmation */}
      {confirmLogoutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">ចេញពីគណនី?</h2>
            <p className="text-sm text-gray-600 mb-6">
              តើអ្នកប្រាកដថាចង់ចេញពីគណនីនេះមែនទេ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                onClick={() => setConfirmLogoutOpen(false)}
              >
                បោះបង់
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={handleLogout}
              >
                ចេញ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CategoryFilter() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState(null);
  const [searchText, setSearchText] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const load = async () => {
      setCatLoading(true);
      setCatError(null);
      try {
        const list = await getCategories();
        setCategories(Array.isArray(list) ? list : []);
      } catch (e) {
        setCatError("Failed to load categories");
      } finally {
        setCatLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => setSearchText(initialSearch), [initialSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => {
    if (pathname !== "/product") return;
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    const qs = params.toString();
    navigate(`/product${qs ? `?${qs}` : ""}`, { replace: true });
  }, [debouncedSearch, selectedCategory, pathname, navigate]);

  return (
    <div className="flex items-center gap-3 py-2">
      <select
        value={selectedCategory}
        onChange={(e) => {
          const v = e.target.value;
          const params = new URLSearchParams();
          if (v) params.set("category", v);
          if (debouncedSearch.trim())
            params.set("search", debouncedSearch.trim());
          const qs = params.toString();
          navigate(`/product${qs ? `?${qs}` : ""}`);
        }}
        className="h-10 rounded-lg border border-green-200 text-green-800 px-3 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
        title="Filter by category"
      >
        <option value="">
          {catLoading ? "កំពុងផ្ទុក..." : "ប្រភេទទាំងអស់"}
        </option>
        {catError ? (
          <option value="">{catError}</option>
        ) : (
          categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.category_name ?? c.name}
            </option>
          ))
        )}
      </select>

      <div className="hidden md:flex gap-2">
        {categories.slice(0, 6).map((c) => {
          const active = String(selectedCategory) === String(c.id);
          return (
            <button
              key={c.id}
              onClick={() => {
                const params = new URLSearchParams();
                params.set("category", c.id);
                if (debouncedSearch.trim())
                  params.set("search", debouncedSearch.trim());
                navigate(`/product?${params.toString()}`);
              }}
              className={
                "px-3 h-9 rounded-full text-sm border " +
                (active
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-green-800 border-green-200 hover:bg-green-50")
              }
              title={c.category_name ?? c.name}
            >
              {c.category_name ?? c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
