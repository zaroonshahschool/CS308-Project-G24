import assert from "node:assert/strict";
import test from "node:test";
import { mapApiCartItemToUiItem, mapUiCartItemToRequestItem } from "./cartUtils.js";

function makeApiItem(overrides = {}) {
  return {
    productId: 42,
    name: "Clean Code",
    author: "Robert C. Martin",
    description: "A handbook of agile software craftsmanship.",
    price: "29.99",
    originalPrice: "39.99",
    discountRate: "25",
    costPrice: "18.00",
    stock: 10,
    imageUrl: "https://example.com/cover.jpg",
    category: "Programming",
    publisher: "Prentice Hall",
    paperType: "Paperback",
    pageCount: 431,
    dimensions: "23x15",
    publicationDate: "2008-08-01",
    isbn: "978-0132350884",
    language: "English",
    coverType: "Soft",
    featured: true,
    editorChoice: false,
    newArrival: true,
    averageRating: "4.5",
    createdAt: "2024-01-01T00:00:00Z",
    quantity: 3,
    ...overrides,
  };
}

test("mapsProductIdToId - productId from API response becomes id in the UI item", () => {
  const result = mapApiCartItemToUiItem(makeApiItem({ productId: 99 }));
  assert.equal(result.id, 99);
});

test("convertsNumericFields - price, originalPrice, discountRate, costPrice and averageRating are Numbers", () => {
  const result = mapApiCartItemToUiItem(makeApiItem());
  assert.equal(typeof result.price, "number");
  assert.equal(typeof result.originalPrice, "number");
  assert.equal(typeof result.discountRate, "number");
  assert.equal(typeof result.costPrice, "number");
  assert.equal(typeof result.averageRating, "number");
  assert.equal(result.price, 29.99);
  assert.equal(result.originalPrice, 39.99);
  assert.equal(result.discountRate, 25);
  assert.equal(result.costPrice, 18);
  assert.equal(result.averageRating, 4.5);
});

test("defaultsOriginalPriceToPrice - originalPrice falls back to price when the API field is null", () => {
  const result = mapApiCartItemToUiItem(makeApiItem({ originalPrice: null, price: "19.99" }));
  assert.equal(result.originalPrice, 19.99);
});

test("defaultsOriginalPriceToPriceWhenUndefined - originalPrice falls back to price when the API field is undefined", () => {
  const apiItem = makeApiItem({ price: "12.50" });
  delete apiItem.originalPrice;
  const result = mapApiCartItemToUiItem(apiItem);
  assert.equal(result.originalPrice, 12.5);
});

test("defaultsDiscountRateToZero - discountRate is 0 when the API field is null", () => {
  const result = mapApiCartItemToUiItem(makeApiItem({ discountRate: null }));
  assert.equal(result.discountRate, 0);
});

test("defaultsCostPriceToPrice - costPrice falls back to price when the API field is null", () => {
  const result = mapApiCartItemToUiItem(makeApiItem({ costPrice: null, price: "15.00" }));
  assert.equal(result.costPrice, 15);
});

test("defaultsAverageRatingToZero - averageRating is 0 when the API field is null", () => {
  const result = mapApiCartItemToUiItem(makeApiItem({ averageRating: null }));
  assert.equal(result.averageRating, 0);
});

test("mapsImageUrlToImageAndImageUrl - imageUrl from API is exposed as both image and imageUrl on the UI item", () => {
  const result = mapApiCartItemToUiItem(makeApiItem({ imageUrl: "https://example.com/book.png" }));
  assert.equal(result.image, "https://example.com/book.png");
  assert.equal(result.imageUrl, "https://example.com/book.png");
});

test("mapsQuantityToQty - API quantity field becomes qty on the UI item", () => {
  const result = mapApiCartItemToUiItem(makeApiItem({ quantity: 7 }));
  assert.equal(result.qty, 7);
});

test("mapsIdToProductIdAndQtyToQuantity - mapUiCartItemToRequestItem maps UI id→productId and qty→quantity", () => {
  const result = mapUiCartItemToRequestItem({ id: 55, qty: 4, name: "Extra field" });
  assert.deepEqual(result, { productId: 55, quantity: 4 });
});
