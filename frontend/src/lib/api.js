const CONFIGURED_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || "";
const DEFAULT_API_PORT = "8080";

function getApiBaseUrl() {
  if (CONFIGURED_API_BASE_URL) {
    return CONFIGURED_API_BASE_URL.replace(/\/$/, "");
  }

  const { protocol, hostname, port } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  // When the frontend is served by Vite or another local static server,
  // send API traffic straight to Spring Boot instead of relying on a dev proxy.
  if (isLocalhost && port !== DEFAULT_API_PORT) {
    return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
  }

  return "";
}

export async function apiFetch(path, options = {}) {
  const token = window.localStorage.getItem("auth_token");
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  const apiBaseUrl = getApiBaseUrl();
  const requestUrl = apiBaseUrl ? `${apiBaseUrl}${path}` : path;

  try {
    response = await fetch(requestUrl, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(`Backend is unavailable. Start the Spring Boot server on http://localhost:${DEFAULT_API_PORT} and try again.`);
  }

  const text = await response.text();
  const contentType = response.headers.get("Content-Type") || "";
  const expectsJson = contentType.includes("application/json");
  let data = null;

  if (text) {
    if (expectsJson) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Backend returned malformed JSON.");
      }
    } else if (text.trim().startsWith("<")) {
      throw new Error(`Request reached a web page instead of the API. Make sure the backend is running on http://localhost:${DEFAULT_API_PORT}.`);
    } else if (!response.ok) {
      throw new Error(text);
    }
  }

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed.");
  }

  return data;
}
