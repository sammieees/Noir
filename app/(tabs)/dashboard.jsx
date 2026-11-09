import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getOrders,
  getProducts,
  money
} from "../../lib/store";

const todayKey = (value) => {
  const d = new Date(value);
  const now = new Date();

  return !Number.isNaN(d.getTime()) &&
    d.toDateString() === now.toDateString();
};

const activeOrder = (order) =>
  String(order.status || "Pending").toLowerCase() !== "cancelled";

const isRecordedSale = (order) =>
  ["paid", "completed"].includes(
    String(order.paymentStatus || "").toLowerCase()
  ) ||
  String(order.status || "").toLowerCase() === "delivered";

export default function Dashboard() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admin, setAdmin] = useState("Admin");

  const load = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem("user");

      if (!saved) {
        router.replace("/login");
        return;
      }

      const user = JSON.parse(saved);

      if (user.role?.toLowerCase() !== "admin") {
        router.replace("/(tabs)/products");
        return;
      }

      const [p, o, rawUsers] = await Promise.all([
        getProducts(),
        getOrders(),
        AsyncStorage.getItem("users")
      ]);

      setProducts(p || []);
      setOrders(o || []);

      setCustomers(
        JSON.parse(rawUsers || "[]").filter(
          (u) => u.role?.toLowerCase() === "customer"
        )
      );

      setAdmin(user.name || user.fullName || "Admin");

    } catch (e) {
      console.log("DASHBOARD ERROR:", e);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const validOrders = orders.filter(activeOrder);

  const revenue = validOrders
    .filter(isRecordedSale)
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const todaySales = validOrders
    .filter((o) => isRecordedSale(o) && todayKey(o.date))
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const lowStock = products.filter(
    (p) => Number(p.stock || 0) <= 5
  );

  const metrics = [
    ["Total Orders", validOrders.length, "receipt-outline"],
    ["Total Revenue", money(revenue), "wallet-outline"],
    ["Today's Sales", money(todaySales), "trending-up-outline"],
    ["Total Customers", customers.length, "people-outline"],
    ["Total Products", products.length, "cube-outline"],
    ["Low Stock Alerts", lowStock.length, "alert-circle-outline"]
  ];

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.top}>
          <View>
            <Text style={styles.brand}>NOIR</Text>
            <Text style={styles.muted}>ADMIN DASHBOARD</Text>
          </View>

          <Pressable
            onPress={() => router.push("/(tabs)/accounts")}
            style={styles.iconButton}
          >
            <Ionicons
              name="settings-outline"
              size={21}
              color="#111"
            />
          </Pressable>
        </View>

        <View style={styles.welcome}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeEyebrow}>
              WELCOME BACK
            </Text>

            <Text style={styles.welcomeName}>
              {admin}
            </Text>

            <Text style={styles.welcomeSub}>
              Here's your store overview.
            </Text>
          </View>

          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={25}
              color="#fff"
            />
          </View>
        </View>

        <View style={styles.grid}>
          {metrics.map(([label, value, icon]) => (
            <View key={label} style={styles.metric}>
              <View style={styles.metricIcon}>
                <Ionicons
                  name={icon}
                  size={19}
                  color="#111"
                />
              </View>

              <Text style={styles.metricLabel}>
                {label}
              </Text>

              <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>
            Recent Orders
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)/admin-orders")}
          >
            <Text style={styles.link}>
              View all
              <Ionicons
                name="chevron-forward"
                size={12}
              />
            </Text>
          </Pressable>
        </View>

        {orders.slice(0, 5).map((order) => (
          <Pressable
            key={String(order.id)}
            style={styles.order}
            onPress={() =>
              router.push({
                pathname: "/admin-order-details/[id]",
                params: { id: String(order.id) }
              })
            }
          >
            <View style={styles.orderIcon}>
              <Ionicons
                name="bag-handle-outline"
                size={18}
                color="#111"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.orderId}>
                #{order.id}
              </Text>

              <Text style={styles.orderDate}>
                {order.date
                  ? new Date(order.date).toLocaleDateString(
                      "en-PH",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      }
                    )
                  : "Date unavailable"}
                {" · "}
                {order.customerName || "Customer"}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.orderAmount}>
                {money(order.total)}
              </Text>

              <Text style={styles.orderStatus}>
                {order.status || "Pending"}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#999"
            />
          </Pressable>
        ))}

        {orders.length === 0 && (
          <Text style={styles.empty}>
            No orders have been placed yet.
          </Text>
        )}

        <Pressable
          style={styles.reportButton}
          onPress={() => router.push("/sales-reports")}
        >
          <Ionicons
            name="bar-chart-outline"
            size={20}
            color="#fff"
          />

          <Text style={styles.reportText}>
            View Sales Report
          </Text>

          <Ionicons
            name="arrow-forward"
            size={17}
            color="#fff"
          />
        </Pressable>

        {lowStock.length > 0 && (
          <View style={styles.lowStock}>
            <Text style={styles.lowTitle}>
              Low stock to review
            </Text>

            {lowStock.slice(0, 4).map((p) => (
              <Text
                key={String(p.id)}
                style={styles.lowItem}
              >
                {p.name} · {p.stock} left
              </Text>
            ))}

            <Pressable
              onPress={() =>
                router.push("/(tabs)/inventory")
              }
            >
              <Text style={styles.link}>
                Manage products
              </Text>
            </Pressable>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  content: {
    padding: 18,
    paddingBottom: 30
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },
  brand: {
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#111"
  },
  muted: {
    fontSize: 10,
    color: "#888",
    letterSpacing: 1,
    marginTop: 2
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  welcome: {
    backgroundColor: "#111",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17
  },
  welcomeEyebrow: {
    fontSize: 10,
    color: "#aaa",
    letterSpacing: 1.2,
    fontWeight: "700"
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginTop: 4
  },
  welcomeSub: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 5
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metric: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 14,
    minHeight: 116
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  metricLabel: {
    fontSize: 11,
    color: "#777",
    fontWeight: "600"
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
    marginTop: 5
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111"
  },
  link: {
    fontSize: 12,
    color: "#111",
    fontWeight: "800"
  },
  order: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  orderIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    justifyContent: "center"
  },
  orderId: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111"
  },
  orderDate: {
    fontSize: 10,
    color: "#888",
    marginTop: 4
  },
  orderAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111"
  },
  orderStatus: {
    fontSize: 10,
    color: "#777",
    marginTop: 4
  },
  empty: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    padding: 22,
    backgroundColor: "#fff",
    borderRadius: 14
  },
  reportButton: {
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 16,
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  reportText: {
    flex: 1,
    color: "#fff",
    fontWeight: "800",
    fontSize: 13
  },
  lowStock: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginTop: 14
  },
  lowTitle: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    color: "#111"
  },
  lowItem: {
    fontSize: 12,
    color: "#666",
    paddingVertical: 4
  }
});