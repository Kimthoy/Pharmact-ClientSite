import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import Client from "./pages/home/Dashboard";
import AllProducts from "./pages/product/AllProducts";
import ProductDetail from "./pages/product/ProductDetail";

import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import WishlistPage from "./pages/cart/WishlistPage";

import RegisterModal from "./pages/auth/RegisterModal";
import Login from "./pages/auth/Login";
import LogoutDashboard from "./pages/home/LogoutDashboard";

export default function App() {
  return (
    <div className="App">
      <Layout>
        <Routes>
          <Route path="/" element={<Client />} />
          <Route path="/product" element={<AllProducts />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* modal routes if you really want them navigable */}
          <Route path="/register" element={<RegisterModal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<LogoutDashboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <ToastContainer
        position="top-left"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
