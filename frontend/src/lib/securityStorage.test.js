import assert from "node:assert/strict";
import test from "node:test";
import {
  clearAuthSession,
  persistAuthSession,
  persistRegistrationHint,
  sanitizeStoredProfile,
} from "./securityStorage.js";

function createMemoryStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("sanitizeStoredProfile returns an empty object for invalid profile data", () => {
  assert.deepEqual(sanitizeStoredProfile(null), {});
  assert.deepEqual(sanitizeStoredProfile("not-json"), {});
  assert.deepEqual(sanitizeStoredProfile(["not", "an", "object"]), {});
});

test("sanitizeStoredProfile keeps only non-sensitive profile fields", () => {
  const sanitized = sanitizeStoredProfile({
    id: "123",
    name: "Jane Doe",
    taxId: "1112223334",
    email: "  Jane@Example.COM ",
    homeAddress: "Istanbul",
    password: "plain-secret",
    cardNumber: "4242424242424242",
    cvv: "123",
  });

  assert.deepEqual(sanitized, {
    id: "123",
    name: "Jane Doe",
    taxId: "1112223334",
    email: "jane@example.com",
    homeAddress: "Istanbul",
  });
});

test("sanitizeStoredProfile does not preserve empty optional fields", () => {
  assert.deepEqual(
    sanitizeStoredProfile({ id: "", name: "Jane Doe", email: "", homeAddress: "" }),
    { name: "Jane Doe" }
  );
});

test("persistAuthSession stores only role and normalized email", () => {
  const storage = createMemoryStorage({ auth_token: "legacy-token" });

  persistAuthSession({ role: "CUSTOMER", email: "  Jane@Example.COM " }, storage);

  assert.equal(storage.getItem("auth_token"), null);
  assert.equal(storage.getItem("auth_role"), "CUSTOMER");
  assert.equal(storage.getItem("auth_email"), "jane@example.com");
});

test("persistAuthSession removes legacy customer profile data", () => {
  const storage = createMemoryStorage({
    customer_profile: JSON.stringify({ email: "jane@example.com", password: "plain-secret" }),
  });

  persistAuthSession({ role: "CUSTOMER", email: "jane@example.com" }, storage);

  assert.equal(storage.getItem("customer_profile"), null);
});

test("persistRegistrationHint stores normalized registration email without profile data", () => {
  const storage = createMemoryStorage({
    customer_profile: JSON.stringify({ email: "jane@example.com", password: "plain-secret" }),
  });

  persistRegistrationHint(" New@Example.COM ", storage);

  assert.equal(storage.getItem("last_registered_email"), "new@example.com");
  assert.equal(storage.getItem("customer_profile"), null);
});

test("clearAuthSession removes auth values and legacy profile while preserving unrelated cart data", () => {
  const storage = createMemoryStorage({
    auth_token: "jwt-token",
    auth_role: "CUSTOMER",
    auth_email: "jane@example.com",
    customer_profile: JSON.stringify({ password: "plain-secret" }),
    guest_cart_items: "[]",
  });

  clearAuthSession(storage);

  assert.equal(storage.getItem("auth_token"), null);
  assert.equal(storage.getItem("auth_role"), null);
  assert.equal(storage.getItem("auth_email"), null);
  assert.equal(storage.getItem("customer_profile"), null);
  assert.equal(storage.getItem("guest_cart_items"), "[]");
});
