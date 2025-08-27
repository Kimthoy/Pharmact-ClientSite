import React from "react";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-10" id="contact">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        <div>
          <h4 className="text-lg text-white mb-2">About</h4>
          <p>Your trusted online pharmacy for health and wellness.</p>
        </div>
        <div>
          <h4 className="text-lg text-white mb-2">Links</h4>
          <ul>
            <li>
              <a href="#features" className="hover:text-white">
                Services
              </a>
            </li>
            <li>
              <a href="#products" className="hover:text-white">
                Products
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-white">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg text-white mb-2">Contact</h4>
          <p>123 Pharmacy St.</p>
          <p>info@pharmacy.com</p>
          <p>+855 12 345 678</p>
        </div>
      </div>
      <p className="text-center text-sm text-gray-500">
        &copy; 2025 Pharmacy Inc. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
