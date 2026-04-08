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

function buildRequestUrl(path) {
  const apiBaseUrl = getApiBaseUrl();
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

function createRequestHeaders(options = {}, accept = "application/json") {
  const token = window.localStorage.getItem("auth_token");
  const headers = new Headers(options.headers ?? {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (accept && !headers.has("Accept")) {
    headers.set("Accept", accept);
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function apiFetch(path, options = {}) {
  const headers = createRequestHeaders(options);

  let response;
  const requestUrl = buildRequestUrl(path);

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

export async function apiFetchBlob(path, options = {}) {
  const headers = createRequestHeaders(options, "application/pdf");
  const requestUrl = buildRequestUrl(path);

  let response;

  try {
    response = await fetch(requestUrl, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(`Backend is unavailable. Start the Spring Boot server on http://localhost:${DEFAULT_API_PORT} and try again.`);
  }

  if (!response.ok) {
    const text = await response.text();
    let message = "Request failed.";

    if (text) {
      try {
        const data = JSON.parse(text);
        message = data?.message ?? message;
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  return response.blob();
}
