import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrders, money } from "../../lib/store";

const FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

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
      console.log("LOAD ORDERS ERROR:", error);
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
    const keyword = search.trim().toLowerCase();

    const matchesStatus =
      filter === "All" ||
      status === filter.toLowerCase();

    const matchesSearch = [
      order.id,
      order.customerName,
      order.customerEmail,
    ].some((value) =>
      String(value || "").toLowerCase().includes(keyword)
    );

    return matchesStatus && matchesSearch;
  });

  const statusColor = (status) => {
    switch (String(status || "Pending").toLowerCase()) {
      case "confirmed":
        return "#e8f2e9";
      case "processing":
        return "#e9efff";
      case "shipped":
        return "#e8efff";
      case "delivered":
        return "#e5f6e9";
      case "cancelled":
        return "#ffe8e8";
      default:
        return "#fff1d6";
    }
  };

  const renderOrder = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
        pathname: "/admin-order-details/[id]",
        params: {
        id: String(item.id),
      },
    })
}
    >
      <View style={styles.cardTop}>
        <View style={styles.orderIcon}>
          <Ionicons
            name="receipt-outline"
            size={21}
            color="#111"
          />
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>
            #{item.id}
          </Text>

          <Text style={styles.customer}>
            {item.customerName || "Customer"}
          </Text>

          <Text style={styles.date}>
            {item.date
              ? new Date(item.date).toLocaleDateString(
                  "en-PH",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )
              : "Date unavailable"}
          </Text>
        </View>

        <View style={styles.right}>
          <Text
            style={[
              styles.status,
              {
                backgroundColor: statusColor(item.status),
              },
            ]}
          >
            {item.status || "Pending"}
          </Text>

          <Text style={styles.amount}>
            {money(item.total)}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color="#999"
        />
      </View>

      <View style={styles.cardBottom}>
        <Text style={styles.itemCount}>
          {(item.items || []).length} product(s)
        </Text>

        <Text style={styles.viewDetails}>
          View Details
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>
            Manage customer purchases
          </Text>
        </View>

        <Pressable
          style={styles.refresh}
          onPress={loadOrders}
        >
          <Ionicons
            name="refresh"
            size={20}
            color="#111"
          />
        </Pressable>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={18}
          color="#888"
        />

        <TextInput
          style={styles.search}
          placeholder="Search orders..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* SMALL HORIZONTAL FILTERS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[
              styles.filterButton,
              filter === item && styles.filterActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === item && styles.filterTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* ORDER COUNT */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filteredOrders.length} Orders
        </Text>

        <Text style={styles.countText}>
          {filter === "All" ? "All Status" : filter}
        </Text>
      </View>

      {/* ORDER LIST */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item, index) =>
            String(item.id || index)
          }
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadOrders}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="receipt-outline"
                size={40}
                color="#bbb"
              />

              <Text style={styles.emptyTitle}>
                No orders found
              </Text>

              <Text style={styles.emptyText}>
                Customer orders will appear here once they
                have been placed.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
  },

  subtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 3,
  },

  refresh: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    height: 44,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 13,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  search: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    color: "#111",
    paddingVertical: 0,
  },

  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 43,
    marginBottom: 5,
  },

  filters: {
    paddingHorizontal: 15,
    alignItems: "center",
    gap: 7,
  },

  filterButton: {
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  filterActive: {
    backgroundColor: "#111",
  },

  filterText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#555",
  },

  filterTextActive: {
    color: "#fff",
  },

  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 8,
  },

  countText: {
    fontSize: 10,
    color: "#888",
    fontWeight: "700",
  },

  list: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 30,
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#fff",
    padding: 13,
    borderRadius: 14,
    marginBottom: 10,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    justifyContent: "center",
  },

  orderInfo: {
    flex: 1,
  },

  orderId: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111",
  },

  customer: {
    fontSize: 11,
    color: "#444",
    marginTop: 4,
  },

  date: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },

  right: {
    alignItems: "flex-end",
    gap: 7,
  },

  status: {
    fontSize: 9,
    fontWeight: "800",
    color: "#333",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },

  amount: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111",
  },

  cardBottom: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 12,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemCount: {
    color: "#888",
    fontSize: 10,
  },

  viewDetails: {
    color: "#111",
    fontSize: 10,
    fontWeight: "800",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingTop: 65,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#333",
    marginTop: 12,
  },

  emptyText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },
});
