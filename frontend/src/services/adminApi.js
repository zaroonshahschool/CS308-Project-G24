import { apiFetch } from "../lib/api";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/product-manager/upload-image", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Image upload failed");
  }
  return response.json();
}

async function sendJson(path, method, body) {
  return apiFetch(`/api${path}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function createCategory(payload) {
  return sendJson("/product-manager/categories", "POST", payload);
}

export function createProduct(payload) {
  return sendJson("/product-manager/products", "POST", payload);
}

export function updateProduct(productId, payload) {
  return sendJson(`/product-manager/products/${productId}`, "PUT", payload);
}

export function deleteProduct(productId) {
  return sendJson(`/product-manager/products/${productId}`, "DELETE");
}

export function fetchDeliveries() {
  return sendJson("/product-manager/deliveries", "GET");
}

export function advanceDeliveryStatus(orderId) {
  return sendJson(`/product-manager/deliveries/${orderId}/advance-status`, "PUT");
}

export function fetchAdminCollections() {
  return sendJson("/product-manager/collections", "GET");
}

export function createCollection(payload) {
  return sendJson("/product-manager/collections", "POST", payload);
}

export function updateCollection(id, payload) {
  return sendJson(`/product-manager/collections/${id}`, "PUT", payload);
}

export function deleteCollection(id) {
  return sendJson(`/product-manager/collections/${id}`, "DELETE");
}

export function fetchAllComments() {
  return sendJson("/product-manager/comments", "GET");
}

export function fetchPendingComments() {
  return sendJson("/product-manager/comments/pending", "GET");
}

export function fetchAllRatings() {
  return sendJson("/product-manager/ratings", "GET");
}

export function deleteRating(ratingId) {
  return sendJson(`/product-manager/ratings/${ratingId}`, "DELETE");
}

export function fetchAllInvoices() {
  return sendJson("/product-manager/invoices", "GET");
}

export function approveComment(commentId) {
  return apiFetch(`/api/comments/${commentId}/approve`, { method: "PATCH" });
}

export function rejectComment(commentId) {
  return sendJson(`/product-manager/comments/${commentId}/reject`, "PUT");
}
