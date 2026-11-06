
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useFocusEffect } from "expo-router";
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
import { getOrders, money } from "../../lib/store";

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const savedUser = await AsyncStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : {};

      const allOrders = await getOrders();

      const email = String(user.email || "")
        .trim()
        .toLowerCase();

      const userId = String(user.id || user.userId || "");

      const customerName = String(
        user.name || user.fullName || ""
      ).trim().toLowerCase();

      const customerOrders = allOrders.filter((order) => {
        if (email && order.customerEmail) {
          return (
            String(order.customerEmail).trim().toLowerCase() === email
          );
        }

        if (userId && order.customerId) {
          return String(order.customerId) === userId;
        }

        return (
          customerName !== "" &&
          String(order.customerName || "").trim().toLowerCase() ===
            customerName
        );
      });

      setOrders(customerOrders);
    } catch (error) {
      console.log("LOAD MY ORDERS ERROR:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return styles.pending;
      case "Processing":
        return styles.processing;
      case "Shipped":
        return styles.shipped;
      case "Delivered":
        return styles.delivered;
      default:
        return styles.pending;
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderInfo}>
          <Text style={styles.orderId}>ORDER ID</Text>
          <Text style={styles.orderNumber}>{item.id}</Text>
        </View>

        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>
            {item.status || "Pending"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.productsTitle}>Purchased Products</Text>

      {(item.items || []).map((product, index) => (
        <View
          key={`${product.id}-${product.size}-${index}`}
          style={styles.productRow}
        >
          {product.image ? (
            <Image
              source={product.image}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>NOIR</Text>
            </View>
          )}

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>

            <Text style={styles.productDetails}>
              Size: {product.size || "N/A"}
            </Text>

            <Text style={styles.productDetails}>
              Quantity: {product.quantity}
            </Text>

            <Text style={styles.productPrice}>
              {money(Number(product.price) * Number(product.quantity))}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Order Date</Text>
        <Text style={styles.infoValue}>{formatDate(item.date)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Payment</Text>
        <Text style={styles.infoValue}>
          {item.paymentMethod || "Cash on Delivery"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Total Price</Text>
        <Text style={styles.totalPrice}>{money(item.total)}</Text>
      </View>

      <View style={styles.addressContainer}>
        <Text style={styles.addressTitle}>Delivery Address</Text>
        <Text style={styles.addressText}>
          {item.deliveryAddress || "No address available"}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111111" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>
            Track your NOIR purchases
          </Text>
        </View>

        <Pressable onPress={loadOrders}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>

          <Text style={styles.emptyTitle}>No Orders Yet</Text>

          <Text style={styles.emptyText}>
            Your purchased products will appear here.
          </Text>

          <Link href="/(tabs)/products" asChild>
            <Pressable style={styles.shopButton}>
              <Text style={styles.shopButtonText}>
                START SHOPPING
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrder}
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
    backgroundColor: "#eef2f7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef2f7",
  },
  loadingText: {
    marginTop: 12,
    color: "#666666",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#111111",
  },
  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 4,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111111",
  },
  list: {
    padding: 15,
    paddingBottom: 25,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderHeaderInfo: {
    flex: 1,
  },
  orderId: {
    color: "#999999",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  orderNumber: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pending: {
    backgroundColor: "#fff1d6",
  },
  processing: {
    backgroundColor: "#e1edff",
  },
  shipped: {
    backgroundColor: "#eee5ff",
  },
  delivered: {
    backgroundColor: "#dff5e5",
  },
  statusText: {
    color: "#222222",
    fontSize: 11,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 15,
  },
  productsTitle: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 14,
  },
  productRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  productImage: {
    width: 85,
    height: 95,
    borderRadius: 9,
    backgroundColor: "#eeeeee",
  },
  imagePlaceholder: {
    width: 85,
    height: 95,
    borderRadius: 9,
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontWeight: "900",
    letterSpacing: 2,
    color: "#555555",
  },
  productInfo: {
    flex: 1,
    paddingLeft: 13,
    justifyContent: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111111",
  },
  productDetails: {
    fontSize: 12,
    color: "#777777",
    marginTop: 5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
    marginTop: 7,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },
  infoLabel: {
    fontSize: 13,
    color: "#777777",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222222",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 10,
  },
  totalPrice: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111111",
  },
  addressContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 9,
    marginTop: 5,
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 5,
  },
  addressText: {
    fontSize: 12,
    color: "#777777",
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyIcon: {
    fontSize: 55,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111111",
  },
  emptyText: {
    fontSize: 13,
    color: "#777777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: "#111111",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 9,
  },
  shopButtonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
});
