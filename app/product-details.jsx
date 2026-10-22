
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

import { getProducts, money } from "../lib/store";
import { useCart } from "./CartContext";

const getProductImage = (product) => {
  if (product?.id === "mw-2" || product?.image === "polo") {
    return require("../assets/products/polo.jpg");
  }

  if (product?.id === "mw-3" || product?.image === "jeans") {
    return require("../assets/products/jeans.jpg");
  }

  if (product?.id === "mw-4" || product?.image === "jacket") {
    return require("../assets/products/jacket.jpg");
  }

  if (
    typeof product?.image === "string" &&
    /^(file|content|https?):\/\//.test(product.image)
  ) {
    return { uri: product.image };
  }

  if (
    typeof product?.imageUri === "string" &&
    product.imageUri.length > 0
  ) {
    return { uri: product.imageUri };
  }

  return null;
};

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const cartContext = useCart();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [selectedSize, setSelectedSize] = useState("L");
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products from AsyncStorage
  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      try {
        const products = await getProducts();

        const list = Array.isArray(products)
          ? products
          : Array.isArray(products?.data)
            ? products.data
            : [];

        if (active) {
          setProductList(list);
        }
      } catch (error) {
        console.log("LOAD PRODUCTS ERROR:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  // Find the selected product
  const product = productList.find(
    (item) => String(item.id) === String(id)
  );

  // Loading screen
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  // Product not found
  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Product not found</Text>
        <Text style={styles.loadingText}>
          Please return to the products page and try again.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const imageSource = getProductImage(product);

  const sizes =
    Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : ["S", "M", "L", "XL"];

  const description =
    product.description ||
    product.desc ||
    product.productDescription ||
    "No description available for this product.";

  const handleAddToCart = () => {
    if (!cartContext || typeof cartContext.addToCart !== "function") {
      Alert.alert(
        "Cart unavailable",
        "The cart is not ready. Please check your CartContext provider."
      );
      return;
    }

    cartContext.addToCart(product, selectedSize);

    Alert.alert("NOIR", "Product added to your cart!");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹  Back to Products</Text>
      </Pressable>

      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Text style={styles.noImageText}>NO IMAGE</Text>
        </View>
      )}

      <Text style={styles.brand}>NOIR</Text>
      <Text style={styles.name}>{product.name}</Text>

      {product.category ? (
        <Text style={styles.category}>{product.category}</Text>
      ) : null}

      <Text style={styles.price}>{money(product.price)}</Text>

      {product.oldPrice != null ? (
        <Text style={styles.oldPrice}>
          {money(product.oldPrice)}
        </Text>
      ) : null}

      <Text style={styles.sectionTitle}>Select Size</Text>

      <View style={styles.sizes}>
        {sizes.map((size) => (
          <Pressable
            key={String(size)}
            onPress={() => setSelectedSize(String(size))}
            style={[
              styles.sizeButton,
              selectedSize === String(size) && styles.selectedSize,
            ]}
          >
            <Text
              style={[
                styles.sizeText,
                selectedSize === String(size) &&
                  styles.selectedSizeText,
              ]}
            >
              {size}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{description}</Text>

      <Pressable
        style={styles.button}
        onPress={handleAddToCart}
      >
        <Text style={styles.buttonText}>ADD TO CART</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingText: {
    color: "#555",
    marginTop: 12,
    textAlign: "center",
  },
  backButton: {
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 320,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#777",
    fontWeight: "700",
  },
  brand: {
    marginTop: 20,
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: "800",
    color: "#777",
  },
  name: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111",
    marginTop: 6,
  },
  category: {
    color: "#777",
    marginTop: 5,
  },
  price: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111",
    marginTop: 12,
  },
  oldPrice: {
    color: "#888",
    textDecorationLine: "line-through",
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
    marginTop: 24,
    marginBottom: 12,
  },
  sizes: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  sizeButton: {
    minWidth: 44,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedSize: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  sizeText: {
    color: "#222",
    fontWeight: "700",
  },
  selectedSizeText: {
    color: "#fff",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: "#555",
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 28,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    color: "#111",
  },
});
