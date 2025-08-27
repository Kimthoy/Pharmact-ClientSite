import "./App.css";
import { Routes, Route } from "react-router-dom";
import Client from "./pages/home/Dashboard";
import AllProducts from "./pages/product/AllProducts";
import Layout from "./components/Layout";
import ProductDetail from "./pages/product/ProductDetail";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";

function App() {
  return (
    <div className="App">
      <Layout>
        <Routes>
          <Route path="/" element={<Client />} />
          <Route path="/product" element={<AllProducts />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </Layout>
    </div>
  );
}
export default App;
