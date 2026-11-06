
import AsyncStorage from "@react-native-async-storage/async-storage";
import { starterProducts } from "../data/products";

const PRODUCTS_KEY = "Noir products";
const SALES_KEY = "Noir sales";
const ORDERS_KEY = "Noir orders";
const WISHLIST_KEY = "Noir wishlist";
const PRODUCTS_VERSION_KEY = "Noir products version";

const CURRENT_PRODUCTS_VERSION = "6";

export async function getProducts() {
  try {
    const raw = await AsyncStorage.getItem(PRODUCTS_KEY);
    const version = await AsyncStorage.getItem(PRODUCTS_VERSION_KEY);

    if (!raw) {
      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(starterProducts));
      await AsyncStorage.setItem(PRODUCTS_VERSION_KEY, CURRENT_PRODUCTS_VERSION);
      return starterProducts;
    }

    let savedProducts = JSON.parse(raw);

    if (!Array.isArray(savedProducts)) {
      savedProducts = [];
    }

    if (version !== CURRENT_PRODUCTS_VERSION) {
      const originalProducts = starterProducts.map((starterProduct) => {
        const oldProduct = savedProducts.find(
          (product) => String(product.id) === String(starterProduct.id)
        );

        return {
          ...starterProduct,
          ...oldProduct,
          image: starterProduct.image,
        };
      });

      const originalIds = starterProducts.map(
        (product) => String(product.id)
      );

      const customProducts = savedProducts.filter(
        (product) => !originalIds.includes(String(product.id))
      );

      savedProducts = [...originalProducts, ...customProducts];

      await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(savedProducts));
      await AsyncStorage.setItem(
        PRODUCTS_VERSION_KEY,
        CURRENT_PRODUCTS_VERSION
      );
    }

    return savedProducts;
  } catch (error) {
    console.log("GET PRODUCTS ERROR:", error);
    return starterProducts;
  }
}

export async function saveProducts(items) {
  try {
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(items));
  } catch (error) {
    console.log("SAVE PRODUCTS ERROR:", error);
    throw error;
  }
}

export async function getSales() {
  try {
    const raw = await AsyncStorage.getItem(SALES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.log("GET SALES ERROR:", error);
    return [];
  }
}

export async function saveSales(items) {
  try {
    await AsyncStorage.setItem(SALES_KEY, JSON.stringify(items));
  } catch (error) {
    console.log("SAVE SALES ERROR:", error);
    throw error;
  }
}

// GET ALL CUSTOMER ORDERS
export async function getOrders() {
  try {
    const raw = await AsyncStorage.getItem(ORDERS_KEY);

    if (!raw) return [];

    const orders = JSON.parse(raw);
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.log("GET ORDERS ERROR:", error);
    return [];
  }
}

// SAVE CUSTOMER ORDERS
export async function saveOrders(items) {
  try {
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(items));
  } catch (error) {
    console.log("SAVE ORDERS ERROR:", error);
    throw error;
  }
}

// GET WISHLIST PRODUCT IDS
export async function getWishlist() {
  try {
    const raw = await AsyncStorage.getItem(WISHLIST_KEY);

    if (!raw) return [];

    const wishlist = JSON.parse(raw);
    return Array.isArray(wishlist) ? wishlist : [];
  } catch (error) {
    console.log("GET WISHLIST ERROR:", error);
    return [];
  }
}

// SAVE WISHLIST PRODUCT IDS
export async function saveWishlist(items) {
  try {
    await AsyncStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(items)
    );
  } catch (error) {
    console.log("SAVE WISHLIST ERROR:", error);
    throw error;
  }
}

// ADD PRODUCT TO WISHLIST
export async function addToWishlist(productId) {
  const currentWishlist = await getWishlist();
  const id = String(productId);

  if (!currentWishlist.some((item) => String(item) === id)) {
    await saveWishlist([...currentWishlist, id]);
  }
}

// REMOVE PRODUCT FROM WISHLIST
export async function removeFromWishlist(productId) {
  const currentWishlist = await getWishlist();
  const id = String(productId);

  const updatedWishlist = currentWishlist.filter(
    (item) => String(item) !== id
  );

  await saveWishlist(updatedWishlist);
}

// CHECK IF PRODUCT IS FAVORITE
export async function isFavorite(productId) {
  const wishlist = await getWishlist();

  return wishlist.some(
    (item) => String(item) === String(productId)
  );
}

// COMPLETE SALE AND UPDATE INVENTORY
export async function completeSale(cartItems) {
  if (!cartItems || cartItems.length === 0) return;

  try {
    const products = await getProducts();
    const oldSales = await getSales();
    const newSales = [];

    const updatedProducts = products.map((product) => {
      const cartItemsForProduct = cartItems.filter(
        (item) => String(item.id) === String(product.id)
      );

      if (cartItemsForProduct.length === 0) return product;

      const quantity = cartItemsForProduct.reduce(
        (sum, item) => sum + Number(item.quantity || 1),
        0
      );

      newSales.push({
        id: `${Date.now()}-${product.id}`,
        productName: product.name,
        quantity,
        total: Number(product.price || 0) * quantity,
        date: new Date().toISOString(),
      });

      return {
        ...product,
        stock: Math.max(
          0,
          Number(product.stock || 0) - quantity
        ),
      };
    });

    await saveProducts(updatedProducts);
    await saveSales([...oldSales, ...newSales]);

    console.log("SALE COMPLETED:", newSales);
  } catch (error) {
    console.log("COMPLETE SALE ERROR:", error);
    throw error;
  }
}

export const money = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
