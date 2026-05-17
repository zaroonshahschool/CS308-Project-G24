import assert from "node:assert/strict";
import test from "node:test";
import { createSafePaymentSummary } from "./secureCheckout.js";

test("createSafePaymentSummary keeps only display-safe card details", () => {
  const summary = createSafePaymentSummary({
    cardholderName: "Jane Doe",
    cardBrand: "Visa",
    cardLast4: "4242",
    transactionId: "TXN-SECRET",
    authorizationCode: "AUTH-SECRET",
  }, "INV-123");

  assert.deepEqual(summary, {
    cardholderName: "Jane Doe",
    paymentMethod: "credit-card",
    cardBrand: "Visa",
    cardLast4: "4242",
    invoiceNumber: "INV-123",
  });
});

test("createSafePaymentSummary does not expose full bank response fields", () => {
  const summary = createSafePaymentSummary({
    cardholderName: "Jane Doe",
    cardBrand: "Mastercard",
    cardLast4: "4444",
    gateway: "Mock Gateway",
    retrievalReference: "RRN-SECRET",
    responseCode: "00",
    cvvResult: "MATCH",
  }, "INV-456");

  assert.equal("gateway" in summary, false);
  assert.equal("retrievalReference" in summary, false);
  assert.equal("responseCode" in summary, false);
  assert.equal("cvvResult" in summary, false);
});

test("createSafePaymentSummary never includes raw card numbers", () => {
  const summary = createSafePaymentSummary({
    cardholderName: "Jane Doe",
    cardBrand: "Visa",
    cardLast4: "4242",
    rawCardNumber: "4242424242424242",
    cardNumber: "4242 4242 4242 4242",
  }, "INV-789");

  assert.equal("rawCardNumber" in summary, false);
  assert.equal("cardNumber" in summary, false);
  assert.equal(summary.cardLast4, "4242");
});
