
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCart } from "../CartContext";

import {
  addToWishlist,
  getProducts,
  getWishlist,
  money,
  removeFromWishlist,
} from "../../lib/store";

export default function ProductsScreen() {
  const router = useRouter();
  const { addToCart, itemCount } = useCart();

  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      const savedFavorites = await getWishlist();

      setProducts(data);
      setFavorites(savedFavorites.map(String));
    } catch (error) {
      console.log("LOAD PRODUCTS ERROR:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const toggleFavorite = async (productId) => {
    const id = String(productId);
    const alreadyFavorite = favorites.includes(id);

    try {
      if (alreadyFavorite) {
        await removeFromWishlist(id);
        setFavorites((current) =>
          current.filter((item) => item !== id)
        );
      } else {
        await addToWishlist(id);
        setFavorites((current) => [...current, id]);
      }
    } catch (error) {
      console.log("WISHLIST ERROR:", error);
    }
  };

  const getSizes = (product) => {
    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }

    if (product.size) {
      return String(product.size)
        .split("/")
        .map((size) => size.trim())
        .filter(Boolean);
    }

    return ["S", "M", "L", "XL"];
  };

  const getProductImage = (product) => {
    const image = product?.image;

    if (image === "polo") {
      return require("../../assets/products/polo.jpg");
    }

    if (image === "jeans") {
      return require("../../assets/products/jeans.jpg");
    }

    if (image === "jacket") {
      return require("../../assets/products/jacket.jpg");
    }

    if (
      typeof image === "string" &&
      image.length > 0 &&
      (
        image.startsWith("file://") ||
        image.startsWith("content://") ||
        image.startsWith("http://") ||
        image.startsWith("https://")
      )
    ) {
      return { uri: image };
    }

    if (product?.imageUri && typeof product.imageUri === "string") {
      return { uri: product.imageUri };
    }

    if (String(product.id) === "mw-2" || String(product.id) === "1") {
      return require("../../assets/products/polo.jpg");
    }

    if (String(product.id) === "mw-3" || String(product.id) === "2") {
      return require("../../assets/products/jeans.jpg");
    }

    if (String(product.id) === "mw-4" || String(product.id) === "3") {
      return require("../../assets/products/jacket.jpg");
    }

    const name = String(product.name || "").toLowerCase();

    if (name.includes("jeans") || name.includes("denim")) {
      return require("../../assets/products/jeans.jpg");
    }

    if (name.includes("jacket")) {
      return require("../../assets/products/jacket.jpg");
    }

    if (name.includes("polo") || name.includes("oxford")) {
      return require("../../assets/products/polo.jpg");
    }

    return null;
  };

  const handleAddToCart = (product) => {
    if (Number(product.stock || 0) <= 0) return;

    const sizes = getSizes(product);
    const defaultSize = sizes[0];

    const productForCart = {
      ...product,
      sizes,
      image: getProductImage(product),
    };

    addToCart(productForCart, defaultSize);
  };

  const openDetails = (product) => {
    router.push({
      pathname: "/details/[id]",
      params: { id: String(product.id) },
    });
  };

  const renderProduct = ({ item }) => {
    const sizes = getSizes(item);
    const productImage = getProductImage(item);
    const stock = Number(item.stock || 0);
    const isSaved = favorites.includes(String(item.id));

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Pressable
            onPress={() => openDetails(item)}
            style={({ pressed }) => ({
              flex: 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {productImage ? (
              <Image
                source={productImage}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.noImage}>
                <Ionicons name="shirt-outline" size={38} color="#999" />
                <Text style={styles.noImageText}>No Image</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>NEW</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.favoriteButton,
              {
                transform: [{ scale: pressed ? 0.85 : 1 }],
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => toggleFavorite(item.id)}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={21}
              color={isSaved ? "#e53945" : "#222222"}
            />
          </Pressable>
        </View>

        <View style={styles.info}>
          <Text style={styles.category}>
            {(item.category || "Menswear").toUpperCase()}
          </Text>

          <Text style={styles.name} numberOfLines={2}>
            {item.name || "Unnamed Product"}
          </Text>

          <Text style={styles.price}>{money(item.price)}</Text>

          <Text style={styles.sizes}>
            Sizes: {sizes.join("  ")}
          </Text>

          <Text style={[styles.stock, stock <= 0 && styles.outOfStock]}>
            {stock > 0 ? `${stock} available` : "Out of stock"}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.detailsButton,
              {
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => openDetails(item)}
          >
            <Text style={styles.detailsText}>View Details</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.cartButton,
              stock <= 0 && styles.disabledButton,
              {
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            disabled={stock <= 0}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.cartButtonText}>
              {stock > 0 ? "+ Add to Cart" : "Out of Stock"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.brand}>NOIR</Text>
                <Text style={styles.subtitle}>Find your style</Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.cartIconButton,
                  {
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => router.push("/(tabs)/cart")}
              >
                <Ionicons name="bag-outline" size={23} color="#111" />

                {itemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{itemCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>LOOK GOOD.</Text>
              <Text style={styles.bannerTitle}>FEEL GOOD.</Text>
              <Text style={styles.bannerDescription}>
                Simple styles made for everyday wear.
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Our Collection</Text>
              <Text style={styles.productCount}>
                {products.length} products
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No Products Yet</Text>
            <Text style={styles.emptyText}>
              Add a product from Inventory.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef2f7" },

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    letterSpacing: 3,
  },

  subtitle: { color: "#777", fontSize: 12, marginTop: 2 },

  cartIconButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#eef2f7",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  cartBadge: {
    position: "absolute",
    right: -2,
    top: -3,
    backgroundColor: "#222",
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  cartBadgeText: { color: "#fff", fontSize: 11, fontWeight: "900" },

  banner: {
    margin: 10,
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 20,
    minHeight: 135,
    justifyContent: "center",
  },

  bannerTitle: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 1,
  },

  bannerDescription: { color: "#ccc", fontSize: 12, marginTop: 8 },

  sectionHeader: {
    paddingHorizontal: 17,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: { fontSize: 20, fontWeight: "900", color: "#222" },
  productCount: { color: "#777", fontSize: 12 },

  list: { paddingHorizontal: 16, paddingBottom: 30 },
  row: { justifyContent: "space-between" },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
  },

  imageContainer: {
    width: "100%",
    height: 190,
    backgroundColor: "#f1f1f1",
    position: "relative",
  },

  productImage: { width: "100%", height: "100%" },

  noImage: { flex: 1, alignItems: "center", justifyContent: "center" },
  noImageText: { color: "#999", fontSize: 11, marginTop: 5 },

  saleBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#222",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  saleText: { color: "#fff", fontSize: 9, fontWeight: "900" },

  favoriteButton: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  info: { padding: 12 },
  category: {
    fontSize: 9,
    fontWeight: "800",
    color: "#888",
    letterSpacing: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "900",
    color: "#222",
    marginTop: 4,
  },

  price: { fontSize: 16, fontWeight: "900", color: "#111", marginTop: 6 },
  sizes: { fontSize: 10, color: "#777", marginTop: 6 },
  stock: { fontSize: 10, color: "#16A34A", fontWeight: "700", marginTop: 5 },
  outOfStock: { color: "#DC2626" },

  detailsButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: "center",
    marginTop: 10,
  },

  detailsText: { fontSize: 12, fontWeight: "800", color: "#222" },

  cartButton: {
    backgroundColor: "#222",
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 7,
  },

  disabledButton: { backgroundColor: "#9CA3AF" },
  cartButtonText: { color: "#fff", fontSize: 12, fontWeight: "900" },

  empty: { padding: 40, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#222" },
  emptyText: { fontSize: 12, color: "#777", marginTop: 6 },
});
