const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

function buildUrl(path, queryParams = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value != null && value !== "" && value !== "All") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

function mapApiProductToUiProduct(product) {
  return {
    id: product.id,
    name: product.name,
    author: product.author,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    image: product.imageUrl,
    imageUrl: product.imageUrl,
    category: product.category,
    model: product.model,
    serialNumber: product.serialNumber,
    warrantyStatus: product.warrantyStatus,
    distributor: product.distributor,
    featured: product.featured,
    editorChoice: product.editorChoice,
    newArrival: product.newArrival,
    createdAt: product.createdAt,
  };
}

export async function fetchCategories() {
  const response = await fetch(buildUrl("/categories"));

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await response.json();
  return data;
}

export async function fetchProducts(category = "All") {
  const response = await fetch(buildUrl("/products", { category }));

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();
  return data.map(mapApiProductToUiProduct);
}

export async function fetchProductById(productId) {
  const response = await fetch(buildUrl(`/products/${productId}`));

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const data = await response.json();
  return mapApiProductToUiProduct(data);
}