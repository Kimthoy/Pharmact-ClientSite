import React from "react";

const Hero = () => (
  <section className="bg-emerald-500 text-white py-20 text-center">
    <div className="max-w-4xl mx-auto px-4">
      <h2 className="sm:text-2xl text-lg font-bold mb-4">
        Your Trusted Pharmacy
      </h2>
      <p className="sm:text-xl text-sm mb-6">
        We deliver health, care, and convenience to your doorstep.
      </p>
      <a
        href="#products"
        className="inline-block px-6 py-3 bg-white text-emerald-600 font-semibold rounded-md hover:bg-gray-100"
      >
        Shop Now
      </a>
    </div>
  </section>
);

export default Hero;
