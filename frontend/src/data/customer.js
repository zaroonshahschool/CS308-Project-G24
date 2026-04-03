import { getProductById, products } from "./products";

export const initialCustomer = {
  id: "CUST-1001",
  name: "Aylin Demir",
  taxId: "TR-9081726354",
  email: "aylin@example.com",
  homeAddress: "Fenerbahce Mah. Moda Cad. No: 18, Kadikoy, Istanbul",
  password: "demo-customer",
};

function makeOrderItem(productId, qty, overrides = {}) {
  const product = getProductById(productId);

  return {
    id: `${productId}-${qty}-${overrides.status ?? "item"}`,
    productId: product.id,
    name: product.name,
    author: product.author,
    category: product.category,
    image: product.image,
    price: product.price,
    qty,
    returnedAt: null,
    ...overrides,
  };
}

export function getInitialOrders() {
  const processingItems = [makeOrderItem(3, 1), makeOrderItem(9, 1)];
  const deliveredItems = [makeOrderItem(7, 1), makeOrderItem(14, 1)];

  return [
    {
      id: "ORD-2026-1002",
      placedAt: "2026-03-26",
      status: "delivered",
      total: deliveredItems.reduce((sum, item) => sum + item.price * item.qty, 0),
      items: deliveredItems,
    },
    {
      id: "ORD-2026-1001",
      placedAt: "2026-03-31",
      status: "processing",
      total: processingItems.reduce((sum, item) => sum + item.price * item.qty, 0),
      items: processingItems,
    },
  ];
}

export function getInitialStockByProduct() {
  return Object.fromEntries(products.map((product) => [product.id, product.stock]));
}
