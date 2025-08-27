import React, { useEffect, useState } from "react";
import { getProducts } from "../../api/prodductService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegHeart, FaHeart } from "react-icons/fa"; // heart icons
import { Link } from "react-router-dom";
const MedicalEquipment = () => {
  const EXCHANGE_RATE = 4100;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState({}); // store productId -> true/false

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProducts();
        setProducts(data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateQuantity = (id, change) => {
    setCart((prev) => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(currentQty + change, 0);
      const newCart = { ...prev, [id]: newQty };

      if (change > 0) {
        toast.success(`Increased quantity to ${newQty}`);
      } else if (change < 0) {
        toast.info(`Decreased quantity to ${newQty}`);
      }

      return newCart;
    });
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      if (updated[id]) {
        toast.success("Item added to Wishlist");
      } else {
        toast.info("Item removed from Wishlist");
      }
      return updated;
    });
  };

  if (loading) return <p className="text-center py-10">Loading products...</p>;

  return (
    <div className="mb-12 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-md font-bold mb-6">Medicine</h1>
        <p className="mb-8">
          Reliable medical tools to support home and clinical care.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {products.map((item) => {
            const qty = cart[item.id] || 0;
            const usdPrice = item.medicine?.price || 0;
            const khrPrice = usdPrice * EXCHANGE_RATE;
            const isWishlisted = wishlist[item.id] || false;

            return (
              <div
                key={item.id}
                className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <button
                  onClick={() => toggleWishlist(item.id)}
                  className="absolute top-2 right-2 text-xl text-red-500"
                >
                  {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                </button>

                <img
                  src={
                    item.medicine?.image ||
                    "https://via.placeholder.com/200x150"
                  }
                  alt={item.medicine?.medicine_name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <h2 className="text-md font-semibold text-green-500">
                  <Link to={`/medicine/${item.medicine?.id}`}>
                    {item.medicine?.medicine_name} | {item.medicine?.weight}
                  </Link>
                </h2>

                <p className="text-sm p-2 text-gray-600 dark:text-gray-300">
                  Type:{" "}
                  {item.medicine?.units?.map((u) => u.unit_name).join(", ")}
                </p>

                <p className="text-md text-gray-600 dark:text-gray-300">
                  {usdPrice
                    ? `$ ${usdPrice.toFixed(
                        2
                      )} | ៛ ${khrPrice.toLocaleString()}`
                    : "—"}
                </p>

                <div className="flex justify-center items-center gap-2 mt-3 border">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="px-2 py-1 text-3xl"
                  >
                    -
                  </button>
                  <span className="text-center px-8 font-medium">{qty}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="px-2 py-1 text-2xl"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
};

export default MedicalEquipment;
