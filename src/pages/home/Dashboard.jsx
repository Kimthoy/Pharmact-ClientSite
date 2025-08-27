import React, { useState } from "react";
import Hero from "../home/components/Hero";
import Products from "../product/Products";
import { mockProducts } from "../../data/mockData";

import ProductsSlider from "../product/ProductsSlider";
import AllProduct from "../product/AllProducts";
const ClientSite = () => {
  return (
    <div>
      <div className="bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100 font-sans min-h-screen">
        <ProductsSlider products={mockProducts} />
        <Hero />
       
        <AllProduct />
      </div>
    </div>
  );
};

export default ClientSite;
