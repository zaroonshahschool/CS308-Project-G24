export function mapApiCartItemToUiItem(item) {
  return {
    id: item.productId,
    name: item.name,
    author: item.author,
    description: item.description,
    price: Number(item.price),
    originalPrice: item.originalPrice != null ? Number(item.originalPrice) : Number(item.price),
    discountRate: item.discountRate != null ? Number(item.discountRate) : 0,
    costPrice: item.costPrice != null ? Number(item.costPrice) : Number(item.price),
    stock: item.stock,
    image: item.imageUrl,
    imageUrl: item.imageUrl,
    category: item.category,
    publisher: item.publisher,
    paperType: item.paperType,
    pageCount: item.pageCount,
    dimensions: item.dimensions,
    publicationDate: item.publicationDate,
    isbn: item.isbn,
    language: item.language,
    coverType: item.coverType,
    featured: item.featured,
    editorChoice: item.editorChoice,
    newArrival: item.newArrival,
    averageRating: item.averageRating != null ? Number(item.averageRating) : 0,
    createdAt: item.createdAt,
    qty: item.quantity,
  };
}

export function mapUiCartItemToRequestItem(item) {
  return {
    productId: item.id,
    quantity: item.qty,
  };
}
