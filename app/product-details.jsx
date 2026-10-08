const getProductImage = (product) => {
  // Default Polo Shirt
  if (
    product?.id === "mw-2" ||
    product?.image === "polo"
  ) {
    return require("../assets/products/polo.jpg");
  }

  // Default Denim Jeans
  if (
    product?.id === "mw-3" ||
    product?.image === "jeans"
  ) {
    return require("../assets/products/jeans.jpg");
  }

  // Default Jacket
  if (
    product?.id === "mw-4" ||
    product?.image === "jacket"
  ) {
    return require("../assets/products/jacket.jpg");
  }

  // Uploaded image
  if (
    typeof product?.image === "string" &&
    (
      product.image.startsWith("file://") ||
      product.image.startsWith("content://") ||
      product.image.startsWith("http://") ||
      product.image.startsWith("https://")
    )
  ) {
    return {
      uri: product.image,
    };
  }

  // Older uploaded image format
  if (
    typeof product?.imageUri === "string" &&
    product.imageUri.length > 0
  ) {
    return {
      uri: product.imageUri,
    };
  }

  // No image
  return null;
};