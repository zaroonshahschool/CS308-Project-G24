import { apiFetch } from "../lib/api";
import { mapApiCartItemToUiItem, mapUiCartItemToRequestItem } from "../lib/cartUtils";

export async function fetchCartItems() {
  const data = await apiFetch("/api/customer/cart");
  return data.map(mapApiCartItemToUiItem);
}

export async function syncCartItems(items) {
  const data = await apiFetch("/api/customer/cart", {
    method: "PUT",
    body: JSON.stringify({
      items: items.map(mapUiCartItemToRequestItem),
    }),
  });

  return data.map(mapApiCartItemToUiItem);
}
