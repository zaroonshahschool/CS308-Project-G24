import { apiFetch } from "../lib/api";

export async function rateProduct(productId, score) {
  return apiFetch(`/api/customer/products/${productId}/rate`, {
    method: "POST",
    body: JSON.stringify({ score }),
  });
}

export async function submitComment(productId, content) {
  return apiFetch(`/api/customer/products/${productId}/comment`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function fetchApprovedComments(productId) {
  return apiFetch(`/api/customer/products/${productId}/comments`);
}