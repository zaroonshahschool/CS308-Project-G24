import { apiFetch, apiFetchBlob } from "../lib/api";

export async function fetchOrders() {
  return apiFetch("/api/sales-manager/orders");
}

export async function advanceOrderStatus(orderId) {
  return apiFetch(`/api/sales-manager/orders/${orderId}/advance-status`, { method: "PUT" });
}

export async function setBasePrice(productId, basePrice) {
  return apiFetch(`/api/sales-manager/products/${productId}/price`, {
    method: "PUT",
    body: JSON.stringify({ basePrice }),
  });
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

export async function fetchReturnRequests() {
  return apiFetch("/api/returns");
}

export async function approveReturnRequest(returnRequestId) {
  return apiFetch(`/api/returns/${returnRequestId}/approve`, { method: "PATCH" });
}

export async function rejectReturnRequest(returnRequestId, reason) {
  return apiFetch(`/api/returns/${returnRequestId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}
