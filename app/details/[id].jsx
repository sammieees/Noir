
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCart } from "../../app/CartContext";
import { getProducts, money } from "../../lib/store";

function getProductImage(product) {
  if (!product) return null;

  const image = product.image;

  if (image && typeof image === "number") return image;

  if (
    typeof image === "string" &&
    (image.startsWith("http") ||
      image.startsWith("file:") ||
      image.startsWith("content:") ||
      image.startsWith("data:"))
  ) {
    return { uri: image };
  }

  const imageName = String(image || "").toLowerCase();
  const productName = String(product.name || "").toLowerCase();

  if (imageName.includes("polo") || productName.includes("polo")) {
    return require("../../assets/products/polo.jpg");
  }

  if (imageName.includes("jeans") || productName.includes("jeans")) {
    return require("../../assets/products/jeans.jpg");
  }

  if (imageName.includes("jacket") || productName.includes("jacket")) {
    return require("../../assets/products/jacket.jpg");
  }

  return null;
}

export default function ProductDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);

      const products = await getProducts();

      const foundProduct = products.find(
        (item) => String(item.id) === String(id)
      );

      setProduct(foundProduct || null);
    } catch (error) {
      console.log("LOAD PRODUCT ERROR:", error);
      Alert.alert("Error", "Unable to load product details.");
    } finally {
      setLoading(false);
    }
  };

  const availableSizes =
    Array.isArray(product?.sizes) && product.sizes.length > 0
      ? product.sizes
      : product?.size
        ? String(product.size)
            .split(",")
            .map((size) => size.trim())
            .filter(Boolean)
        : ["S", "M", "L", "XL", "XXL"];

  const imageSource = getProductImage(product);
  const stock = Number(product?.stock || 0);

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert("Select Size", "Please select your size first.");
      return;
    }

    if (stock <= 0) {
      Alert.alert("Out of Stock", "This product is unavailable.");
      return;
    }

    addToCart(product, selectedSize);

    Alert.alert(
      "Added to Cart",
      `${product.name} (${selectedSize}) has been added to your cart.`
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111111" />
        <Text style={styles.loadingText}>LOADING NOIR...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="bag-outline" size={55} color="#999999" />
        <Text style={styles.notFoundTitle}>Product Not Found</Text>
        <Text style={styles.notFoundText}>
          This product is no longer available.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)/products")}
        >
          <Text style={styles.backButtonText}>BACK TO SHOP</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#111111" />
          </Pressable>

          <View style={styles.brandContainer}>
            <Text style={styles.brand}>NOIR</Text>
            <Text style={styles.brandSubtitle}>MEN'S COLLECTION</Text>
          </View>

          <Pressable
            style={styles.iconButton}
            onPress={() => router.push("/(tabs)/cart")}
          >
            <Ionicons name="bag-outline" size={23} color="#111111" />
          </Pressable>
        </View>

        {/* PRODUCT IMAGE */}
        <View style={styles.imageWrapper}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={55} color="#999999" />
              <Text style={styles.placeholderText}>
                NO IMAGE AVAILABLE
              </Text>
            </View>
          )}

          <View style={styles.imageLabel}>
            <Text style={styles.imageLabelText}>NOIR ESSENTIALS</Text>
          </View>
        </View>

        {/* PRODUCT INFORMATION */}
        <View style={styles.detailsContainer}>
          <View style={styles.categoryRow}>
            <Text style={styles.category}>
              {(product.category || "MEN'S WEAR").toUpperCase()}
            </Text>

            <View
              style={[
                styles.stockBadge,
                stock > 0 ? styles.inStockBadge : styles.outStockBadge,
              ]}
            >
              <View
                style={[
                  styles.stockDot,
                  stock > 0 ? styles.inStockDot : styles.outStockDot,
                ]}
              />
              <Text
                style={[
                  styles.stockBadgeText,
                  stock > 0 ? styles.inStockText : styles.outStockText,
                ]}
              >
                {stock > 0 ? "IN STOCK" : "OUT OF STOCK"}
              </Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          <Text style={styles.price}>{money(product.price)}</Text>

          <View style={styles.divider} />

          {/* DESCRIPTION */}
          <Text style={styles.sectionLabel}>PRODUCT DETAILS</Text>

          <Text style={styles.description}>
            {product.description ||
              "Designed for everyday confidence. A stylish addition to your wardrobe, made for a clean and timeless look."}
          </Text>

          {product.color ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>COLOR</Text>
              <Text style={styles.infoValue}>{product.color}</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PRODUCT CODE</Text>
            <Text style={styles.infoValue}>{String(product.id)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AVAILABLE STOCK</Text>
            <Text style={styles.infoValue}>{stock} pieces</Text>
          </View>

          <View style={styles.divider} />

          {/* SIZE SELECTION */}
          <View style={styles.sizeHeader}>
            <Text style={styles.sectionLabel}>SELECT YOUR SIZE</Text>
            <Text style={styles.sizeGuide}>SIZE</Text>
          </View>

          <View style={styles.sizeContainer}>
            {availableSizes.map((size) => (
              <Pressable
                key={String(size)}
                style={[
                  styles.sizeButton,
                  selectedSize === size && styles.selectedSizeButton,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeButtonText,
                    selectedSize === size && styles.selectedSizeText,
                  ]}
                >
                  {size}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.selectedSizeLabel}>
            {selectedSize
              ? `SELECTED SIZE: ${selectedSize}`
              : "PLEASE SELECT YOUR SIZE"}
          </Text>

          {/* ADD TO CART */}
          <Pressable
            style={[
              styles.addToCartButton,
              stock <= 0 && styles.disabledButton,
            ]}
            onPress={handleAddToCart}
            disabled={stock <= 0}
          >
            <Text style={styles.addToCartText}>
              {stock <= 0 ? "OUT OF STOCK" : "ADD TO CART"}
            </Text>
            {stock > 0 && (
              <Ionicons name="arrow-forward" size={19} color="#ffffff" />
            )}
          </Pressable>

          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/(tabs)/products")}
          >
            <Text style={styles.backButtonText}>CONTINUE SHOPPING</Text>
          </Pressable>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerBrand}>NOIR</Text>
            <Text style={styles.footerText}>
              LOOK GOOD. FEEL GOOD.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f5",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f5",
    padding: 20,
  },

  loadingText: {
    marginTop: 15,
    color: "#555555",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
  },

  notFoundTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111111",
    marginTop: 15,
  },

  notFoundText: {
    marginTop: 8,
    color: "#777777",
  },

  header: {
    height: 75,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 25,
    backgroundColor: "#f5f5f3",
    justifyContent: "center",
    alignItems: "center",
  },

  brandContainer: {
    alignItems: "center",
  },

  brand: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 7,
    color: "#111111",
  },

  brandSubtitle: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#888888",
    marginTop: 3,
  },

  imageWrapper: {
    margin: 15,
    marginBottom: 0,
    height: 390,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e9e9e7",
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
    backgroundColor: "#e9e9e7",
  },

  placeholderText: {
    color: "#888888",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 12,
    fontWeight: "700",
  },

  imageLabel: {
    position: "absolute",
    bottom: 15,
    left: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 4,
  },

  imageLabelText: {
    color: "#111111",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
  },

  detailsContainer: {
    backgroundColor: "#ffffff",
    margin: 15,
    marginTop: 15,
    padding: 22,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  category: {
    fontSize: 10,
    fontWeight: "800",
    color: "#888888",
    letterSpacing: 2,
    flex: 1,
  },

  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 4,
  },

  inStockBadge: {
    backgroundColor: "#edf5ed",
  },

  outStockBadge: {
    backgroundColor: "#fbeeee",
  },

  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 5,
    marginRight: 6,
  },

  inStockDot: {
    backgroundColor: "#43834c",
  },

  outStockDot: {
    backgroundColor: "#c44242",
  },

  stockBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  inStockText: {
    color: "#43834c",
  },

  outStockText: {
    color: "#c44242",
  },

  productName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: 0.3,
    lineHeight: 35,
  },

  price: {
    fontSize: 23,
    fontWeight: "800",
    color: "#111111",
    marginTop: 9,
  },

  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 23,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: 2,
  },

  description: {
    fontSize: 14,
    lineHeight: 24,
    color: "#777777",
    marginTop: 13,
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },

  infoLabel: {
    color: "#999999",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  infoValue: {
    color: "#222222",
    fontSize: 12,
    fontWeight: "700",
  },

  sizeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sizeGuide: {
    color: "#999999",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
  },

  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 17,
  },

  sizeButton: {
    width: 52,
    height: 49,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  selectedSizeButton: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },

  sizeButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#333333",
  },

  selectedSizeText: {
    color: "#ffffff",
  },

  selectedSizeLabel: {
    color: "#999999",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 15,
    marginBottom: 20,
  },

  addToCartButton: {
    backgroundColor: "#111111",
    height: 56,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  disabledButton: {
    backgroundColor: "#999999",
  },

  addToCartText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 2,
  },

  backButton: {
    backgroundColor: "#ffffff",
    height: 52,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#dddddd",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#222222",
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 2,
  },

  footer: {
    alignItems: "center",
    marginTop: 35,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },

  footerBrand: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 7,
  },

  footerText: {
    color: "#999999",
    fontSize: 9,
    letterSpacing: 3,
    marginTop: 7,
    marginBottom: 8,
  },
});
