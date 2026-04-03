const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";

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
  const requestUrl = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

  try {
    response = await fetch(requestUrl, {
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
