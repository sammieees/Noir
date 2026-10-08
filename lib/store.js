import AsyncStorage from "@react-native-async-storage/async-storage";

const PRODUCTS_KEY = "mens-hub products";
const SALES_KEY = "mens-hub sales";
const PRODUCTS_VERSION_KEY = "mens-hub products version";

const CURRENT_PRODUCTS_VERSION = "3";

export const starterProducts = [
  {
    id: "mw-2",
    name: "Polo Shirt",
    category: "Shirts",
    price: 499,
    oldPrice: 699,
    stock: 25,
    color: "White",
    sizes: ["S", "M", "L", "XL"],
    description:
      "A simple white polo shirt that is comfortable and easy to match.",
    image: "polo",
  },

  {
    id: "mw-3",
    name: "Denim Jeans",
    category: "Pants",
    price: 1299,
    oldPrice: 1499,
    stock: 20,
    color: "Blue",
    sizes: ["30", "32", "34"],
    description:
      "Comfortable denim jeans for casual and everyday outfits.",
    image: "jeans",
  },

  {
    id: "mw-4",
    name: "Everyday Jacket",
    category: "Jackets",
    price: 1899,
    oldPrice: 2199,
    stock: 10,
    color: "Blue",
    sizes: ["M", "L", "XL"],
    description:
      "A stylish jacket that is perfect for casual outfits.",
    image: "jacket",
  },
];

export async function getProducts() {
  try {
    const raw =
      await AsyncStorage.getItem(
        PRODUCTS_KEY
      );

    const version =
      await AsyncStorage.getItem(
        PRODUCTS_VERSION_KEY
      );

    if (!raw) {
      await AsyncStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(starterProducts)
      );

      await AsyncStorage.setItem(
        PRODUCTS_VERSION_KEY,
        CURRENT_PRODUCTS_VERSION
      );

      return starterProducts;
    }

    let savedProducts = JSON.parse(raw);

    if (!Array.isArray(savedProducts)) {
      savedProducts = [];
    }

    // Update the original products
    // but keep all custom Inventory products
    if (
      version !== CURRENT_PRODUCTS_VERSION
    ) {
      const originalProducts =
        starterProducts.map(
          (starterProduct) => {
            const oldProduct =
              savedProducts.find(
                (product) =>
                  String(product.id) ===
                  String(
                    starterProduct.id
                  )
              );

            return {
              ...starterProduct,
              ...oldProduct,

              // Make sure original image
              // is restored
              image:
                starterProduct.image,
            };
          }
        );

      const originalIds =
        starterProducts.map(
          (product) =>
            String(product.id)
        );

      const customProducts =
        savedProducts.filter(
          (product) =>
            !originalIds.includes(
              String(product.id)
            )
        );

      savedProducts = [
        ...originalProducts,
        ...customProducts,
      ];

      await AsyncStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(savedProducts)
      );

      await AsyncStorage.setItem(
        PRODUCTS_VERSION_KEY,
        CURRENT_PRODUCTS_VERSION
      );
    }

    return savedProducts;
  } catch (error) {
    console.log(
      "GET PRODUCTS ERROR:",
      error
    );

    return starterProducts;
  }
}

export async function saveProducts(
  items
) {
  try {
    await AsyncStorage.setItem(
      PRODUCTS_KEY,
      JSON.stringify(items)
    );
  } catch (error) {
    console.log(
      "SAVE PRODUCTS ERROR:",
      error
    );
  }
}

export async function getSales() {
  try {
    const raw =
      await AsyncStorage.getItem(
        SALES_KEY
      );

    return raw
      ? JSON.parse(raw)
      : [];
  } catch (error) {
    console.log(
      "GET SALES ERROR:",
      error
    );

    return [];
  }
}

export async function saveSales(
  items
) {
  try {
    await AsyncStorage.setItem(
      SALES_KEY,
      JSON.stringify(items)
    );
  } catch (error) {
    console.log(
      "SAVE SALES ERROR:",
      error
    );
  }
}

export async function completeSale(
  cartItems
) {
  if (
    !cartItems ||
    cartItems.length === 0
  ) {
    return;
  }

  try {
    const products =
      await getProducts();

    const oldSales =
      await getSales();

    const newSales = [];

    const updatedProducts =
      products.map((product) => {
        const cartItemsForProduct =
          cartItems.filter(
            (item) =>
              item.id === product.id
          );

        if (
          cartItemsForProduct.length ===
          0
        ) {
          return product;
        }

        const quantity =
          cartItemsForProduct.reduce(
            (sum, item) =>
              sum +
              Number(
                item.quantity || 1
              ),
            0
          );

        newSales.push({
          id: `${Date.now()}-${product.id}`,
          productName:
            product.name,
          quantity: quantity,
          total:
            Number(
              product.price || 0
            ) * quantity,
          date:
            new Date().toISOString(),
        });

        return {
          ...product,
          stock: Math.max(
            0,
            Number(
              product.stock || 0
            ) - quantity
          ),
        };
      });

    await saveProducts(
      updatedProducts
    );

    await saveSales([
      ...oldSales,
      ...newSales,
    ]);

    console.log(
      "SALE COMPLETED:",
      newSales
    );
  } catch (error) {
    console.log(
      "COMPLETE SALE ERROR:",
      error
    );

    throw error;
  }
}

export const money = (value) =>
  `₱${Number(
    value || 0
  ).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;