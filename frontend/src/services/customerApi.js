import { apiFetch } from "../lib/api";

export async function fetchProfile() {
  return apiFetch("/api/customer/me");
}

export async function updateAddress(data) {
  return apiFetch("/api/customer/address", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}