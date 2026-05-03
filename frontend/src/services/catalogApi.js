import { apiFetch } from "../lib/api";

function mapApiProductToUiProduct(product) {
  return {
    id: product.id,
    name: product.name,
    author: product.author,
    description: product.description,
    price: Number(product.price),
    originalPrice: product.originalPrice != null ? Number(product.originalPrice) : Number(product.price),
    discountRate: product.discountRate != null ? Number(product.discountRate) : 0,
    costPrice: product.costPrice != null ? Number(product.costPrice) : Number(product.price),
    stock: product.stock,
    image: product.imageUrl,
    imageUrl: product.imageUrl,
    category: product.category,
    publisher: product.publisher,
    paperType: product.paperType,
    pageCount: product.pageCount,
    dimensions: product.dimensions,
    publicationDate: product.publicationDate,
    isbn: product.isbn,
    language: product.language,
    coverType: product.coverType,
    featured: product.featured,
    editorChoice: product.editorChoice,
    newArrival: product.newArrival,
    createdAt: product.createdAt,
  };
}

export async function fetchCategories() {
  return apiFetch("/api/categories");
}

export async function fetchProducts(category = "All") {
  const query = category && category !== "All"
    ? `?category=${encodeURIComponent(category)}`
    : "";
  const data = await apiFetch(`/api/products${query}`);
  return data.map(mapApiProductToUiProduct);
}

export async function fetchProductById(productId) {
  const data = await apiFetch(`/api/products/${productId}`);
  return mapApiProductToUiProduct(data);
}
