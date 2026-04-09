import { apiFetch } from "../lib/api";

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
