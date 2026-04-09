import { apiFetch } from "../lib/api";

export async function fetchWishlistProductIds() {
  const data = await apiFetch("/api/customer/wishlist");
  return data.map((item) => item.productId);
}

export async function addWishlistProduct(productId) {
  const data = await apiFetch(`/api/customer/wishlist/${productId}`, { method: "POST" });
  return data.map((item) => item.productId);
}

export async function removeWishlistProduct(productId) {
  const data = await apiFetch(`/api/customer/wishlist/${productId}`, { method: "DELETE" });
  return data.map((item) => item.productId);
}
