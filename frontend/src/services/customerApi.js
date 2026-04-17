import { apiFetch, apiFetchBlob } from "../lib/api";

function mapApiOrderToUiOrder(order) {
  return {
    id: `ORD-${order.orderId}`,
    backendOrderId: order.orderId,
    placedAt: order.createdAt.slice(0, 10),
    status: "processing",
    allowCancellation: false,
    total: Number(order.totalPrice),
    items: order.items.map((item) => ({
      id: `${order.orderId}-${item.productId}`,
      productId: item.productId,
      name: item.productName,
      price: Number(item.unitPrice),
      qty: item.quantity,
      returnedAt: null,
    })),
  };
}

export async function fetchProfile() {
  return apiFetch("/api/customer/me");
}

export async function updateAddress(data) {
  return apiFetch("/api/customer/address", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchOrders() {
  const data = await apiFetch("/api/customer/orders");
  return data.map(mapApiOrderToUiOrder);
}

export async function placeOrder(cartItems, shippingAddress) {
  const data = await apiFetch("/api/customer/orders", {
    method: "POST",
    body: JSON.stringify({
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.qty,
      })),
      shippingAddress,
    }),
  });

  return mapApiOrderToUiOrder(data);
}

export async function fetchInvoicePdf(orderId) {
  return apiFetchBlob(`/api/customer/orders/${orderId}/invoice`);
}
