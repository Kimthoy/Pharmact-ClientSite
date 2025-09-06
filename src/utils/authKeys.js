// src/utils/authKeys.js
export const getCurrentUser = () =>
  JSON.parse(localStorage.getItem("customer") || "null");

export const getCurrentUserId = () => getCurrentUser()?.id || "guest";

// Namespaced keys => cart:123, wishlist:123 (or cart:guest while logged out)
export const cartKey = (uid = getCurrentUserId()) => `cart:${uid}`;
export const wishKey = (uid = getCurrentUserId()) => `wishlist:${uid}`;

// Simple event so components can react to login/logout/account switch
export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event("auth:changed"));
};
