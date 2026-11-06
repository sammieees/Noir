
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getProducts,
  getWishlist,
  money,
  removeFromWishlist,
} from "../../lib/store";
import { useCart } from "../CartContext";
export default function WishlistScreen() {
  const router = useRouter();
  const { addToCart } = useCart();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

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
      (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("file://") ||
        image.startsWith("content://")
      )
    ) {
      return { uri: image };
    }

    if (product?.imageUri) {
      return { uri: product.imageUri };
    }

    const name = String(product?.name || "").toLowerCase();

    if (name.includes("polo") || name.includes("oxford")) {
      return require("../../assets/products/polo.jpg");
    }

    if (name.includes("jeans") || name.includes("denim")) {
      return require("../../assets/products/jeans.jpg");
    }

    if (name.includes("jacket")) {
      return require("../../assets/products/jacket.jpg");
    }

    return null;
  };

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);

      const products = await getProducts();
      const savedIds = await getWishlist();

      const favoriteProducts = products.filter((product) =>
        savedIds.some((id) => String(id) === String(product.id))
      );

      setFavorites(favoriteProducts);
    } catch (error) {
      console.log("LOAD WISHLIST ERROR:", error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);

      setFavorites((current) =>
        current.filter(
          (item) => String(item.id) !== String(productId)
        )
      );
    } catch (error) {
      console.log("REMOVE FAVORITE ERROR:", error);
    }
  };

  const handleAddToCart = (product) => {
    if (Number(product.stock || 0) <= 0) return;

    const sizes =
      Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes
        : product.size
          ? String(product.size).split("/").map((size) => size.trim())
          : ["S", "M", "L", "XL"];

    const productForCart = {
      ...product,
      sizes,
      image: getProductImage(product),
    };

    addToCart(productForCart, sizes[0]);
  };

  const openDetails = (product) => {
    router.push({
      pathname: "/details/[id]",
      params: { id: String(product.id) },
    });
  };

  const renderFavorite = ({ item }) => {
    const image = getProductImage(item);
    const stock = Number(item.stock || 0);

    return (
      <View style={styles.card}>
        <Pressable onPress={() => openDetails(item)}>
          {image ? (
            <Image
              source={image}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={38} color="#999" />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemove(item.id)}
        >
          <Ionicons name="heart" size={21} color="#e53945" />
        </Pressable>

        <View style={styles.info}>
          <Text style={styles.category}>
            {(item.category || "MEN'S WEAR").toUpperCase()}
          </Text>

          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.price}>{money(item.price)}</Text>

          <Text style={[styles.stock, stock <= 0 && styles.outOfStock]}>
            {stock > 0 ? `${stock} available` : "Out of stock"}
          </Text>

          <Pressable
            style={styles.detailsButton}
            onPress={() => openDetails(item)}
          >
            <Text style={styles.detailsText}>VIEW DETAILS</Text>
          </Pressable>

          <Pressable
            style={[
              styles.cartButton,
              stock <= 0 && styles.disabledButton,
            ]}
            disabled={stock <= 0}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.cartButtonText}>
              {stock > 0 ? "ADD TO CART" : "OUT OF STOCK"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>NOIR</Text>
          <Text style={styles.subtitle}>YOUR PERSONAL COLLECTION</Text>
        </View>

        <Ionicons name="heart" size={27} color="#111111" />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>My Wishlist</Text>
        <Text style={styles.count}>
          {favorites.length} saved items
        </Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#111111" />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={45} color="#999999" />
          </View>

          <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>

          <Text style={styles.emptyText}>
            Save your favorite styles and find them here anytime.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.push("/(tabs)/products")}
          >
            <Text style={styles.shopButtonText}>EXPLORE COLLECTION</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderFavorite}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f5",
  },

  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  brand: {
    fontSize: 23,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: 5,
  },

  subtitle: {
    fontSize: 9,
    color: "#999999",
    letterSpacing: 2,
    marginTop: 4,
  },

  titleContainer: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 23,
    fontWeight: "900",
    color: "#111111",
  },

  count: {
    color: "#888888",
    fontSize: 11,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  row: {
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    position: "relative",
  },

  productImage: {
    width: "100%",
    height: 190,
    backgroundColor: "#eeeeee",
  },

  noImage: {
    width: "100%",
    height: 190,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eeeeee",
  },

  noImageText: {
    color: "#999999",
    fontSize: 11,
    marginTop: 5,
  },

  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 37,
    height: 37,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  info: {
    padding: 12,
  },

  category: {
    color: "#999999",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  name: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 5,
  },

  price: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 7,
  },

  stock: {
    color: "#39834b",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 5,
  },

  outOfStock: {
    color: "#d32f2f",
  },

  detailsButton: {
    borderWidth: 1,
    borderColor: "#dddddd",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },

  detailsText: {
    color: "#222222",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  cartButton: {
    backgroundColor: "#111111",
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },

  disabledButton: {
    backgroundColor: "#999999",
  },

  cartButtonText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#888888",
    fontSize: 12,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#eeeeec",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    color: "#111111",
    fontSize: 19,
    fontWeight: "900",
  },

  emptyText: {
    color: "#888888",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 9,
  },

  shopButton: {
    backgroundColor: "#111111",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 6,
    marginTop: 25,
  },

  shopButtonText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
});
