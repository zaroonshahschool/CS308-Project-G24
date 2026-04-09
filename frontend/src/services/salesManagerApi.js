import { apiFetch } from "../lib/api";

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
