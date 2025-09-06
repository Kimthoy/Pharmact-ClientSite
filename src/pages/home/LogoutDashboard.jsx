import React from "react";
import { useNavigate } from "react-router-dom";
import { FiLogIn, FiUserPlus } from "react-icons/fi";

const LogoutDashboard = () => {
  const navigate = useNavigate();

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-emerald-600 text-white py-12">
        <div className="max-w-6xl mx-auto text-center px-4">
          <img
            src="/logo.png"
            alt="Panharith Pharmacy"
            className="mx-auto w-20 h-20 mb-4 rounded-full"
          />
          <h1 className="text-3xl font-bold">You’ve Logged Out</h1>
          <p className="mt-2 text-lg">
            Thank you for visiting Panharith Pharmacy. Come back anytime!
          </p>

          {/* CTAs */}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium shadow hover:bg-gray-100"
            >
              <FiLogIn /> Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow hover:bg-emerald-800"
            >
              <FiUserPlus /> Register
            </button>
          </div>
        </div>
      </section>

      {/* Intro/About */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-emerald-700 mb-4">
          About Panharith Pharmacy
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Founded in 2017, Panharith Pharmacy is committed to bringing safe,
          reliable, and affordable medicine to communities. We partner with
          leading distributors to ensure fast delivery, trusted products, and
          professional service.
        </p>
        <p className="text-gray-700 mt-3 leading-relaxed">
          With over 1,000+ satisfied customers and a network of certified
          partners, we are proud to be your trusted pharmacy partner.
        </p>
      </section>

      {/* Partners */}
      <section className="bg-white py-12 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-xl font-semibold text-center text-emerald-700 mb-6">
            Our Trusted Partners
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center">
            <img
              src="/partners/partner1.png"
              alt="Partner 1"
              className="mx-auto h-12"
            />
            <img
              src="/partners/partner2.png"
              alt="Partner 2"
              className="mx-auto h-12"
            />
            <img
              src="/partners/partner3.png"
              alt="Partner 3"
              className="mx-auto h-12"
            />
            <img
              src="/partners/partner4.png"
              alt="Partner 4"
              className="mx-auto h-12"
            />
            {/* Add more partner logos as needed */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-600 text-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} Panharith Pharmacy. All rights
          reserved.
        </div>
      </footer>
    </main>
  );
};

export default LogoutDashboard;
