const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

async function sendJson(path, method, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      message = `${message} (${response.status})`;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
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