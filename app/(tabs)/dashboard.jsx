import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getProducts, getSales, money } from "../../lib/store";

export default function Dashboard() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admin, setAdmin] = useState("NOIR Admin");

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

      const [p, s, rawUsers] = await Promise.all([
        getProducts(),
        getSales(),
        AsyncStorage.getItem("users"),
      ]);

      setProducts(p || []);
      setSales(s || []);

      const users = JSON.parse(rawUsers || "[]");

      setCustomers(
        users.filter(
          (x) => x.role?.toLowerCase() === "customer"
        )
      );

      setAdmin(user.name || "NOIR Admin");
    } catch (error) {
      console.log("DASHBOARD ERROR:", error);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const revenue = sales.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  const stock = products.reduce(
    (sum, item) => sum + Number(item.stock || 0),
    0
  );

  const low = products.filter(
    (item) => Number(item.stock || 0) <= 5
  );

  const stat = (label, value, icon) => (
    <View style={styles.stat} key={label}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const action = (label, icon, route) => (
    <Pressable
      key={label}
      style={({ pressed }) => [
        styles.action,
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(route)}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.top}>
          <View>
            <Text style={styles.brand}>NOIR</Text>
            <Text style={styles.sub}>Admin Dashboard</Text>
          </View>

          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push("/(tabs)/accounts")}
          >
            <Text style={styles.bell}>⚙</Text>
          </Pressable>
        </View>

        {/* WELCOME */}

        <View style={styles.welcome}>
          <Text style={styles.welcomeSmall}>
            Welcome back,
          </Text>

          <Text style={styles.welcomeName}>
            {admin}
          </Text>

          <Text style={styles.welcomeSmall}>
            Here's your store overview.
          </Text>
        </View>

        {/* STATISTICS */}

        <View style={styles.grid}>
          {stat("Total Products", products.length, "▣")}
          {stat("Total Revenue", money(revenue), "₱")}
          {stat("Total Sales", sales.length, "▥")}
          {stat("Customers", customers.length, "♟")}
          {stat("Total Stock", stock, "□")}
          {stat("Low Stock", low.length, "⚠")}
        </View>

        {/* QUICK ACTIONS */}

        <Text style={styles.heading}>
          Quick Actions
        </Text>

        <View style={styles.actions}>
          {action(
            "Manage Products",
            "▣",
            "/(tabs)/inventory"
          )}

          {action(
            "Manage Orders",
            "▤",
            "/(tabs)/admin-orders"
          )}

          {action(
            "View Sales",
            "↗",
            "/(tabs)/sales"
          )}

          {action(
            "Manage Customers",
            "♟",
            "/(tabs)/customers"
          )}

          {action(
            "Account Settings",
            "⚙",
            "/(tabs)/accounts"
          )}
        </View>

        {/* RECENT ACTIVITY */}

        <View style={styles.sectionRow}>
          <Text style={styles.heading}>
            Recent Activity
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)/sales")}
          >
            <Text style={styles.see}>See All ›</Text>
          </Pressable>
        </View>

        {sales.length > 0 ? (
          [...sales]
            .reverse()
            .slice(0, 4)
            .map((s, i) => (
              <View
                key={`${s.id || "sale"}-${i}`}
                style={styles.activity}
              >
                <Text style={styles.activityIcon}>▣</Text>

                <View style={{ flex: 1 }}>
                  <Text style={styles.activityName}>
                    {s.productName || "New Sale"}
                  </Text>

                  <Text style={styles.activityDate}>
                    {s.date
                      ? new Date(s.date).toLocaleString()
                      : "Recently"}
                  </Text>
                </View>

                <Text style={styles.amount}>
                  {money(s.total)}
                </Text>
              </View>
            ))
        ) : (
          <Text style={styles.empty}>
            No sales activity yet.
          </Text>
        )}

        {/* LOW STOCK PRODUCTS */}

        <Text style={styles.heading}>
          Low Stock Products
        </Text>

        {low.length > 0 ? (
          low.map((p, index) => (
            <View
              key={`${p.id || p.name || "product"}-${index}`}
              style={styles.activity}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.activityName}>
                  {p.name}
                </Text>
              </View>

              <Text style={styles.low}>
                {p.stock} left
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>
            All products have enough stock.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },

  content: {
    padding: 18,
    paddingBottom: 30,
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  brand: {
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 3,
    color: "#111",
  },

  sub: {
    color: "#777",
    fontSize: 12,
  },

  settingsButton: {
    width: 42,
    height: 42,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  bell: {
    fontSize: 22,
    color: "#111",
  },

  welcome: {
    backgroundColor: "#111",
    borderRadius: 17,
    padding: 21,
    marginBottom: 18,
  },

  welcomeSmall: {
    color: "#ddd",
    fontSize: 12,
  },

  welcomeName: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    marginVertical: 5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },

  stat: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
  },

  statIcon: {
    fontSize: 21,
    color: "#111",
  },

  statLabel: {
    fontSize: 11,
    color: "#777",
    marginTop: 7,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
    marginTop: 3,
  },

  heading: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111",
    marginTop: 10,
    marginBottom: 11,
  },

  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 15,
  },

  action: {
    backgroundColor: "#fff",
    width: "48%",
    flexGrow: 1,
    borderRadius: 13,
    padding: 15,
    alignItems: "center",
    minHeight: 85,
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.65,
    backgroundColor: "#eeeeee",
  },

  actionIcon: {
    fontSize: 25,
    color: "#111",
  },

  actionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#222",
    marginTop: 7,
    textAlign: "center",
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  see: {
    fontSize: 12,
    color: "#333",
  },

  activity: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 13,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  activityIcon: {
    fontSize: 19,
    color: "#111",
  },

  activityName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
  },

  activityDate: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },

  amount: {
    fontWeight: "900",
    fontSize: 13,
    color: "#111",
  },

  low: {
    color: "#c47722",
    fontWeight: "800",
  },

  empty: {
    backgroundColor: "#fff",
    padding: 17,
    borderRadius: 12,
    color: "#777",
    textAlign: "center",
    marginBottom: 10,
  },
});
