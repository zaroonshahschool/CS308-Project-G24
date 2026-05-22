const LEGACY_PROFILE_KEY = "customer_profile";

function getStorage(storage) {
  return storage ?? window.localStorage;
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function sanitizeStoredProfile(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    return {};
  }

  const allowedFields = ["id", "name", "taxId", "email", "homeAddress"];
  return Object.fromEntries(
    allowedFields
      .filter((field) => profile[field] != null && profile[field] !== "")
      .map((field) => [field, field === "email" ? normalizeEmail(profile[field]) : profile[field]])
  );
}

export function removeLegacySensitiveProfile(storage) {
  getStorage(storage).removeItem(LEGACY_PROFILE_KEY);
}

export function persistAuthSession({ role, email }, storage) {
  const targetStorage = getStorage(storage);
  targetStorage.setItem("auth_role", role);
  targetStorage.setItem("auth_email", normalizeEmail(email));
  targetStorage.removeItem("auth_token");
  removeLegacySensitiveProfile(targetStorage);
}

export function persistRegistrationHint(email, storage) {
  const targetStorage = getStorage(storage);
  targetStorage.setItem("last_registered_email", normalizeEmail(email));
  removeLegacySensitiveProfile(targetStorage);
}

export function clearAuthSession(storage) {
  const targetStorage = getStorage(storage);
  targetStorage.removeItem("auth_token");
  targetStorage.removeItem("auth_role");
  targetStorage.removeItem("auth_email");
  removeLegacySensitiveProfile(targetStorage);
}
