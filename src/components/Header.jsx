import React from "react";
import { BsSun } from "react-icons/bs";
import { FiMoon } from "react-icons/fi";
import { FiShoppingCart } from "react-icons/fi";
import { BiChevronDown } from "react-icons/bi";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

/* ---------- Lightweight Select (inline) ---------- */
function Select({
  value,
  onChange,
  options = [], // [{ value: 'USD', label: 'USD' }]
  className = "",
  srLabel, // screen-reader label
  disabled = false,
}) {
  return (
    <label className={`relative inline-block ${className}`}>
      {srLabel && <span className="sr-only">{srLabel}</span>}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="
          h-10 pl-3 pr-9 rounded-lg border
          bg-white dark:bg-gray-700 dark:text-white
          border-gray-300 dark:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-emerald-500
          appearance-none
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <BiChevronDown
        className="
          pointer-events-none absolute right-2 top-1/2 -translate-y-1/2
          h-5 w-5 text-gray-500 dark:text-gray-300
        "
      />
    </label>
  );
}

/* ---------------------- Header ---------------------- */
const Header = ({
  // theme
  toggleTheme,
  darkMode,

  // current values (controlled by parent)
  language = "EN",
  currency = "USD",

  // preferred explicit setters
  onLanguageChange,
  onCurrencyChange,

  // backward-compat (if you only had togglers before)
  toggleLanguage,
  toggleCurrency,
}) => {
  const navigate = useNavigate();
  const { countQty } = useCart();
  const badge = Number(countQty || 0);

  const handleLanguageChange = (val) => {
    if (onLanguageChange) onLanguageChange(val);
    else if (toggleLanguage) toggleLanguage(val);
  };

  const handleCurrencyChange = (val) => {
    if (onCurrencyChange) onCurrencyChange(val);
    else if (toggleCurrency) toggleCurrency(val);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="Pharmacy"
            className="w-11 h-11 rounded-full"
          />
          <h1 className="text-xl font-bold">Panharith Pharmacy</h1>
        </div>

        {/* Nav */}
        <nav className="space-x-6 hidden md:flex">
          <a href="/" className="hover:text-emerald-500">
            Home
          </a>
          <a href="/product" className="hover:text-emerald-500">
            Products
          </a>
          <a href="#contact" className="hover:text-emerald-500">
            Contact
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Currency */}
          <Select
            srLabel="Currency"
            value={currency}
            onChange={handleCurrencyChange}
            options={[
              { value: "USD", label: "USD" },
              { value: "KHR", label: "KHR" },
            ]}
          />

          {/* Language */}
          <Select
            srLabel="Language"
            value={language}
            onChange={handleLanguageChange}
            options={[
              { value: "EN", label: "EN" }, // 🇺🇸 add flag text if you want: "EN 🇺🇸"
              { value: "KH", label: "KH" }, // 🇰🇭 -> "KH 🇰🇭"
            ]}
          />

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full dark:bg-gray-700"
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <FiMoon className="w-6 h-6 text-green-500" />
            ) : (
              <BsSun className="w-6 h-6 text-green-500" />
            )}
          </button>

          {/* Cart */}
          <button
            className="relative w-10 h-10 flex items-center justify-center text-green-500 dark:bg-gray-700"
            aria-label="Cart"
            onClick={() => navigate("/cart")}
          >
            <FiShoppingCart className="w-6 h-6" />
            {badge > 0 && (
              <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                {badge}
              </div>
            )}
          </button>

          {/* Profile */}
          <button
            className="w-10 h-10 rounded-full dark:bg-gray-700 overflow-hidden border-2 border-gray-300 dark:border-gray-600"
            aria-label="Profile"
          >
            <img
              src="https://i.pravatar.cc/40"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
