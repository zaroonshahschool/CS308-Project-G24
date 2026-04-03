const BASE_URL = "http://localhost:8080";

export async function apiFetch(path, options = {}) {
  const token = window.localStorage.getItem("auth_token");
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error("Backend is unavailable. Start the Spring Boot server on http://localhost:8080 and try again.");
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed.");
  }

  return data;
}
