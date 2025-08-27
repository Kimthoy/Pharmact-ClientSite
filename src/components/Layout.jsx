import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleTheme = () => setDarkMode(!darkMode);
  const [language, setLanguage] = useState("EN");
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "EN" ? "KH" : "EN"));
  };
  const [currency, setCurrency] = useState("USD");
  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "USD" ? "KHR" : "USD"));
  };
  return (
    <div className={darkMode ? "dark" : ""}>
      <Header
        toggleTheme={toggleTheme}
        darkMode={darkMode}
        language={language}
        toggleLanguage={toggleLanguage}
        currency={currency}
        toggleCurrency={toggleCurrency}
      />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
