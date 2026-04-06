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