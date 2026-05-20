export function createSafePaymentSummary(bankResponse, invoiceNumber) {
  return {
    cardholderName: bankResponse.cardholderName,
    paymentMethod: "credit-card",
    cardBrand: bankResponse.cardBrand,
    cardLast4: bankResponse.cardLast4,
    invoiceNumber,
  };
}
