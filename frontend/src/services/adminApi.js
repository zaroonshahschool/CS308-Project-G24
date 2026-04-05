import { apiFetch } from "../lib/api";

async function sendJson(path, method, body) {
  return apiFetch(`/api${path}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function createCategory(payload) {
  return sendJson("/admin/categories", "POST", payload);
}

export function createProduct(payload) {
  return sendJson("/admin/products", "POST", payload);
}

export function updateProduct(productId, payload) {
  return sendJson(`/admin/products/${productId}`, "PUT", payload);
}

export function deleteProduct(productId) {
  return sendJson(`/admin/products/${productId}`, "DELETE");
}
