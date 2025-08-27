import React, { useState } from "react";
import { Link } from "react-router-dom";
const Products = ({ products }) => {
  const visibleProducts = products.slice(0, 8);

  return (
    <section id="products" className="py-10 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-bold text-center mb-10">
          Popular Products
        </h3>
        <Link
          to="/product"
          className="inline-block px-4 py-2  text-green-600 rounded mb-3 underline"
        >
          View More
        </Link>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {visibleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded shadow hover:shadow-md transition"
            >
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image}
                  className="w-full h-32 object-cover rounded mb-3"
                  alt={product.name}
                />
                <h4 className="font-semibold">{product.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                  {product.price}
                </p>
              </Link>

              {/* Buttons */}
              <div className="flex justify-between gap-2 mt-2">
                <button
                  className="flex-1 text-xs px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
                  onClick={() => console.log("Add to cart:", product.id)}
                >
                  Add to Cart
                </button>
                <button
                  className="flex-1 text-xs px-2 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded"
                  onClick={() => console.log("Wishlist:", product.id)}
                >
                  Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
