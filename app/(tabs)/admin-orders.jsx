import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrders, money } from "../../lib/store";

const FILTERS = ["All", "Pending", "Processing", "Shipped", "Delivered"];

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("LOAD ADMIN ORDERS ERROR:", error);
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

  const filteredOrders = orders.filter((order) => {
    const status = String(order.status || "Pending").toLowerCase();
    const selected = filter.toLowerCase();

    const matchesStatus =
      filter === "All" || status === selected;

    const keyword = search.toLowerCase();

    const matchesSearch =
      String(order.id || "").toLowerCase().includes(keyword) ||
      String(order.customerName || "").toLowerCase().includes(keyword) ||
      String(order.customerEmail || "").toLowerCase().includes(keyword);

    return matchesStatus && matchesSearch;
  });

  const statusColor = (status) => {
    switch (String(status || "Pending").toLowerCase()) {
      case "delivered":
        return { backgroundColor: "#e5f6e9", color: "#16803c" };
      case "shipped":
        return { backgroundColor: "#e8efff", color: "#2859b8" };
      case "processing":
        return { backgroundColor: "#e8f2ff", color: "#1765b5" };
      case "cancelled":
        return { backgroundColor: "#ffe8e8", color: "#c62828" };
      default:
        return { backgroundColor: "#fff1d6", color: "#9a6500" };
    }
  };

  const renderOrder = ({ item }) => {
    const status = item.status || "Pending";
    const badge = statusColor(status);

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/admin-order-details/[id]",
            params: { id: String(item.id) },
          })
        }
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>#{item.id}</Text>
            <Text style={styles.customer}>
              {item.customerName || "Customer"}
            </Text>
            <Text style={styles.date}>
              {item.date
                ? new Date(item.date).toLocaleString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Date unavailable"}
            </Text>
          </View>

          <Text style={[
            styles.status,
            { backgroundColor: badge.backgroundColor, color: badge.color },
          ]}>
            {status}
          </Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.itemCount}>
            {(item.items || []).length} product(s)
          </Text>
          <Text style={styles.amount}>{money(item.total)}</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Manage customer purchases</Text>
        </View>

        <Pressable onPress={loadOrders}>
          <Ionicons name="refresh" size={23} color="#111" />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          style={styles.search}
          placeholder="Search orders..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.filterButton,
              filter === item && styles.filterActive,
            ]}
          >
            <Text style={[
              styles.filterText,
              filter === item && styles.filterTextActive,
            ]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No orders found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f6f6" },
  header: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 13,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 25, fontWeight: "900", color: "#111" },
  subtitle: { fontSize: 12, color: "#888", marginTop: 3 },
  searchBox: {
    height: 45,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  search: { flex: 1, marginLeft: 8, color: "#111" },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  filterActive: { backgroundColor: "#111" },
  filterText: { fontSize: 10, color: "#555", fontWeight: "700" },
  filterTextActive: { color: "#fff" },
  list: { padding: 14, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 13,
    marginBottom: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  orderId: { fontSize: 13, color: "#111", fontWeight: "900" },
  customer: { fontSize: 12, color: "#333", marginTop: 5 },
  date: { fontSize: 10, color: "#888", marginTop: 4 },
  status: {
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 15,
    overflow: "hidden",
  },
  cardBottom: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 12,
    paddingTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemCount: { flex: 1, color: "#777", fontSize: 11 },
  amount: { fontSize: 14, fontWeight: "900", color: "#111" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 50,
    fontSize: 13,
  },
});