export function maskCardNumber(cardLast4) {
  const safeLast4 = String(cardLast4 ?? "").replace(/\D/g, "").slice(-4);
  return safeLast4 ? `**** **** **** ${safeLast4}` : "**** **** ****";
}

export function createSafePaymentSummary(bankResponse, invoiceNumber) {
  return {
    paymentMethod: "credit-card",
    cardBrand: bankResponse.cardBrand,
    cardLast4: bankResponse.cardLast4,
    maskedCardNumber: maskCardNumber(bankResponse.cardLast4),
    invoiceNumber,
  };
}
