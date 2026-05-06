import { apiFetch } from "../lib/api";
import { fetchProductById } from "./catalogApi";

function mapApiProductToUiProduct(product) {
  return {
    id: product.id,
    name: product.name,
    author: product.author,
    description: product.description,
    price: Number(product.price),
    originalPrice: product.originalPrice != null ? Number(product.originalPrice) : Number(product.price),
    discountRate: product.discountRate != null ? Number(product.discountRate) : 0,
    stock: product.stock,
    image: product.imageUrl,
    imageUrl: product.imageUrl,
    category: product.category,
    featured: product.featured,
    editorChoice: product.editorChoice,
    newArrival: product.newArrival,
    limitedEdition: product.limitedEdition,
    averageRating: product.averageRating != null ? Number(product.averageRating) : 0,
  };
}

export async function fetchCollections() {
  return apiFetch("/api/collections");
}

export async function fetchCollectionById(id) {
  const data = await apiFetch(`/api/collections/${id}`);
  return {
    ...data,
    products: (data.products || []).map(mapApiProductToUiProduct),
  };
}
