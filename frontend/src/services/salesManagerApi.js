import { apiFetch, apiFetchBlob } from "../lib/api";

export async function fetchPendingComments() {
  return apiFetch("/api/sales-manager/comments/pending");
}

export async function approveComment(commentId) {
  return apiFetch(`/api/sales-manager/comments/${commentId}/approve`, { method: "PUT" });
}

export async function rejectComment(commentId) {
  return apiFetch(`/api/sales-manager/comments/${commentId}/reject`, { method: "PUT" });
}

export async function fetchOrders() {
  return apiFetch("/api/sales-manager/orders");
}

export async function advanceOrderStatus(orderId) {
  return apiFetch(`/api/sales-manager/orders/${orderId}/advance-status`, { method: "PUT" });
}

export async function applyDiscount(discountRate, productIds) {
  return apiFetch("/api/sales-manager/discounts", {
    method: "POST",
    body: JSON.stringify({ discountRate, productIds }),
  });
}

export async function fetchInvoices(from, to) {
  const query = new URLSearchParams({ from, to });
  return apiFetch(`/api/sales-manager/invoices?${query.toString()}`);
}

export async function fetchInvoicePdfForManager(orderId) {
  return apiFetchBlob(`/api/sales-manager/invoices/${orderId}/pdf`);
}

export async function fetchAnalytics(from, to) {
  const query = new URLSearchParams({ from, to });
  return apiFetch(`/api/sales-manager/analytics?${query.toString()}`);
}

export async function fetchAllRatings() {
  return apiFetch("/api/sales-manager/ratings");
}

export async function deleteRating(ratingId) {
  return apiFetch(`/api/sales-manager/ratings/${ratingId}`, { method: "DELETE" });
}
