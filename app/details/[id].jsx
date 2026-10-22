import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { getProducts, money } from "../../lib/store";

export default function ProductDetailsRoute() {
  const { id: routeId } = useLocalSearchParams();
  const router = useRouter();
  const id = Array.isArray(routeId) ? routeId[0] : routeId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getProducts()
      .then((products) => {
        const list = Array.isArray(products) ? products : [];
        const selected = list.find(
          (item) => String(item.id) === String(id)
        );

        if (active) setProduct(selected || null);
      })
      .catch(() => {
        if (active) setProduct(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹ Back to Products</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator size="large" color="#111" />
      ) : product ? (
        <View style={styles.card}>
          <Text style={styles.eyebrow}>NOIR · PRODUCT DETAILS</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.id}>Product ID: {product.id}</Text>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.price}>{money(product.price)}</Text>

          <Text style={styles.description}>
            {product.description || "No description available."}
          </Text>

          <Text style={styles.detail}>
            Color: {product.color || "Not specified"}
          </Text>
          <Text style={styles.detail}>
            Sizes: {product.sizes?.join(", ") || "Not specified"}
          </Text>
          <Text style={styles.detail}>
            Stock: {Number(product.stock || 0)} available
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.name}>Product not found</Text>
          <Text style={styles.description}>No product matches ID {id}.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backText: {
    color: "#222",
    fontSize: 15,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
  },
  eyebrow: {
    color: "#777",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  name: {
    color: "#111",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 12,
  },
  id: {
    color: "#777",
    fontSize: 12,
    marginTop: 6,
  },
  category: {
    color: "#777",
    marginTop: 12,
  },
  price: {
    color: "#111",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },
  description: {
    color: "#555",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 20,
  },
  detail: {
    color: "#555",
    fontSize: 14,
    marginTop: 12,
  },
});