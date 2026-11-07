import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrders, getSales, money } from "../../lib/store";

export default function SalesScreen() {
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);

  const load = useCallback(async () => {
    const [salesData, orderData] = await Promise.all([
      getSales(),
      getOrders(),
    ]);
    setSales(salesData || []);
    setOrders(orderData || []);
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const revenue = orders.length
    ? orders
        .filter((o) => String(o.status || "").toLowerCase() !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total || 0), 0)
    : sales.reduce((sum, s) => sum + Number(s.total || 0), 0);

  const completedOrders = orders.filter(
    (o) => String(o.status || "").toLowerCase() !== "cancelled"
  );

  const viewSale = (sale) => {
    Alert.alert(
      "Transaction Details",
      `Product: ${sale.productName || "Product"}\nQuantity: ${sale.quantity || 1}\nAmount: ${money(sale.total)}\nDate: ${
        sale.date ? new Date(sale.date).toLocaleString() : "Unavailable"
      }`
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Sales</Text>
            <Text style={styles.subtitle}>Store revenue and transactions</Text>
          </View>
          <Pressable onPress={load}>
            <Ionicons name="refresh" size={22} color="#111" />
          </Pressable>
        </View>

        <View style={styles.metric}>
          <View style={styles.metricTop}>
            <Ionicons name="wallet-outline" size={22} color="#111" />
            <Text style={styles.metricLabel}>TOTAL REVENUE</Text>
          </View>
          <Text style={styles.metricValue}>{money(revenue)}</Text>
          <Text style={styles.metricNote}>All non-cancelled orders</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.smallMetric}>
            <Ionicons name="receipt-outline" size={21} color="#111" />
            <Text style={styles.smallLabel}>Total Orders</Text>
            <Text style={styles.smallValue}>{completedOrders.length}</Text>
          </View>
          <View style={styles.smallMetric}>
            <Ionicons name="cart-outline" size={21} color="#111" />
            <Text style={styles.smallLabel}>Transactions</Text>
            <Text style={styles.smallValue}>{sales.length}</Text>
          </View>
        </View>

        <Pressable
          style={styles.reportButton}
          onPress={() => router.push("/sales-reports")}
        >
          <Ionicons name="bar-chart-outline" size={20} color="#111" />
          <Text style={styles.reportText}>View Sales Reports</Text>
          <Ionicons name="chevron-forward" size={18} color="#111" />
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Text style={styles.muted}>{sales.length} total</Text>
        </View>

        {[...sales].reverse().map((sale, index) => (
          <Pressable
            key={sale.id || index}
            style={styles.transaction}
            onPress={() => viewSale(sale)}
          >
            <View style={styles.transactionIcon}>
              <Ionicons name="receipt-outline" size={19} color="#111" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>
                {sale.productName || "Product Sale"}
              </Text>
              <Text style={styles.date}>
                {sale.date
                  ? new Date(sale.date).toLocaleDateString("en-PH")
                  : "Date unavailable"}
              </Text>
              <Text style={styles.quantity}>
                Quantity: {sale.quantity || 1}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.amount}>{money(sale.total)}</Text>
              <Ionicons name="chevron-forward" size={17} color="#999" />
            </View>
          </Pressable>
        ))}

        {sales.length === 0 && (
          <Text style={styles.empty}>
            No transactions recorded yet.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f6f6" },
  content: { padding: 17, paddingBottom: 35 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 25, fontWeight: "900", color: "#111" },
  subtitle: { fontSize: 12, color: "#888", marginTop: 3 },
  metric: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },
  metricTop: { flexDirection: "row", alignItems: "center", gap: 9 },
  metricLabel: { color: "#777", fontSize: 10, fontWeight: "900" },
  metricValue: {
    color: "#111",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 12,
  },
  metricNote: { color: "#999", fontSize: 10, marginTop: 4 },
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 13 },
  smallMetric: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 13,
    padding: 15,
  },
  smallLabel: { fontSize: 11, color: "#777", marginTop: 8 },
  smallValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginTop: 4,
  },
  reportButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 22,
  },
  reportText: { flex: 1, fontSize: 13, fontWeight: "900", color: "#111" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "900", color: "#111" },
  muted: { fontSize: 10, color: "#888" },
  transaction: {
    backgroundColor: "#fff",
    padding: 13,
    borderRadius: 12,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    justifyContent: "center",
  },
  productName: { color: "#111", fontSize: 12, fontWeight: "900" },
  date: { color: "#888", fontSize: 10, marginTop: 4 },
  quantity: { color: "#888", fontSize: 10, marginTop: 2 },
  amount: { color: "#111", fontSize: 12, fontWeight: "900" },
  empty: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 12,
    textAlign: "center",
    color: "#888",
  },
});