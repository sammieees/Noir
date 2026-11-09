
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

export default function WishlistScreen() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);

      const [allProducts, savedItems] = await Promise.all([
        getProducts(),
        getWishlist(),
      ]);

      const productList = Array.isArray(allProducts)
        ? allProducts
        : [];

      const wishlist = Array.isArray(savedItems)
        ? savedItems
        : [];

      const savedProducts = wishlist
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            const itemId = String(item.id ?? item._id);
            return (
              productList.find(
                (product) =>
                  String(product.id ?? product._id) === itemId
              ) || item
            );
          }

          return productList.find(
            (product) =>
              String(product.id ?? product._id) === String(item)
          );
        })
        .filter(Boolean);

      setProducts(savedProducts);
    } catch (error) {
      console.log("Wishlist loading error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWishlist();
    }, [loadWishlist])
  );

  const getProductId = (product) =>
    product.id ?? product._id;

  const getProductImage = (product) => {
    const image =
      product.image ??
      product.imageUrl ??
      product.photo ??
      product.thumbnail;

    if (!image) return null;

    if (typeof image === "number") {
      return image;
    }

    if (typeof image === "object" && image.uri) {
      return { uri: image.uri };
    }

    if (typeof image === "string") {
      if (
        image.startsWith("http://") ||
        image.startsWith("https://")
      ) {
        return { uri: image };
      }
    }

    return null;
  };

  const handleRemove = async (product) => {
    try {
      await removeFromWishlist(getProductId(product));

      setProducts((previous) =>
        previous.filter(
          (item) =>
            String(getProductId(item)) !==
            String(getProductId(product))
        )
      );
    } catch (error) {
      console.log("Remove wishlist error:", error);
    }
  };

  const openProduct = (product) => {
    router.push({
      pathname: "/details/[id]",
      params: {
        id: String(getProductId(product)),
      },
    });
  };

  const renderProduct = ({ item }) => {
    const imageSource = getProductImage(item);

    return (
      <View style={styles.productCard}>
        <Pressable
          style={styles.imageContainer}
          onPress={() => openProduct(item)}
        >
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="shirt-outline"
                size={42}
                color="#999"
              />
            </View>
          )}

          <Pressable
            style={styles.removeButton}
            onPress={() => handleRemove(item)}
          >
            <Ionicons
              name="heart"
              size={19}
              color="#111"
            />
          </Pressable>
        </Pressable>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name ?? item.title ?? "Product"}
          </Text>

          <Text style={styles.productCategory}>
            {item.category ?? "MEN'S WEAR"}
          </Text>

          <Text style={styles.productPrice}>
            {money(item.price ?? 0)}
          </Text>

          <Pressable
            style={styles.viewButton}
            onPress={() => openProduct(item)}
          >
            <Text style={styles.viewButtonText}>
              VIEW PRODUCT
            </Text>
            <Ionicons
              name="arrow-forward"
              size={15}
              color="#fff"
            />
          </Pressable>

          <Pressable
            style={styles.removeTextButton}
            onPress={() => handleRemove(item)}
          >
            <Ionicons
              name="trash-outline"
              size={15}
              color="#777"
            />
            <Text style={styles.removeText}>
              Remove from wishlist
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
          <Text style={styles.headerSubtitle}>
            YOUR PERSONAL COLLECTION
          </Text>
          <Text style={styles.headerTitle}>Wishlist</Text>
        </View>

        <View style={styles.countContainer}>
          <Ionicons
            name="heart"
            size={17}
            color="#fff"
          />
          <Text style={styles.countText}>
            {products.length}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingText}>
            Loading your wishlist...
          </Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="heart-outline"
              size={42}
              color="#111"
            />
          </View>

          <Text style={styles.emptyTitle}>
            YOUR WISHLIST IS EMPTY
          </Text>

          <Text style={styles.emptyDescription}>
            Save your favorite pieces here and come back
            whenever you're ready.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.push("/products")}
          >
            <Text style={styles.shopButtonText}>
              EXPLORE PRODUCTS
            </Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color="#fff"
            />
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) =>
            String(getProductId(item) ?? index)
          }
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionDescription}>
              {products.length} SAVED{" "}
              {products.length === 1 ? "ITEM" : "ITEMS"}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerSubtitle: {
    fontSize: 9,
    letterSpacing: 2.5,
    color: "#888",
    fontWeight: "600",
    marginBottom: 7,
  },

  headerTitle: {
    fontSize: 29,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -1,
  },

  countContainer: {
    backgroundColor: "#111",
    borderRadius: 25,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  countText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 20,
  },

  listContent: {
    paddingHorizontal: 15,
    paddingTop: 18,
    paddingBottom: 35,
  },

  sectionDescription: {
    fontSize: 10,
    color: "#888",
    letterSpacing: 1.5,
    fontWeight: "700",
    marginBottom: 15,
    marginLeft: 3,
  },

  productRow: {
    justifyContent: "space-between",
  },

  productCard: {
    width: "48.5%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  imageContainer: {
    height: 175,
    backgroundColor: "#EEEEEE",
    position: "relative",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAEAEA",
  },

  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  productInfo: {
    padding: 11,
  },

  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },

  productCategory: {
    fontSize: 9,
    color: "#999",
    letterSpacing: 1,
    marginTop: 5,
  },

  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111",
    marginTop: 8,
    marginBottom: 11,
  },

  viewButton: {
    backgroundColor: "#111",
    borderRadius: 6,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },

  viewButtonText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  removeTextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 11,
    paddingVertical: 3,
  },

  removeText: {
    fontSize: 10,
    color: "#777",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#888",
    fontSize: 12,
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 50,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#111",
  },

  emptyDescription: {
    fontSize: 12,
    lineHeight: 20,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  shopButton: {
    backgroundColor: "#111",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  shopButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
