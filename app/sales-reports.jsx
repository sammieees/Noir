import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrders, getSales, money } from "../lib/store";

export default function SalesReports() {
  const router = useRouter();
  const [period, setPeriod] = useState("Monthly");
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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const report = useMemo(() => {
    const now = new Date();
    let start = new Date(now);

    if (period === "Daily") {
      start.setHours(0, 0, 0, 0);
    } else if (period === "Weekly") {
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const selectedOrders = orders.filter((order) => {
      const date = new Date(order.date);
      return (
        !Number.isNaN(date.getTime()) &&
        date >= start &&
        date <= now &&
        String(order.status || "Pending").toLowerCase() !== "cancelled"
      );
    });

    const selectedSales = sales.filter((sale) => {
      const date = new Date(sale.date);
      return (
        !Number.isNaN(date.getTime()) &&
        date >= start &&
        date <= now
      );
    });

    const revenue = selectedOrders.length
      ? selectedOrders.reduce(
          (sum, order) => sum + Number(order.total || 0),
          0
        )
      : selectedSales.reduce(
          (sum, sale) => sum + Number(sale.total || 0),
          0
        );

    return {
      revenue,
      orders: selectedOrders.length,
      sales: selectedSales,
    };
  }, [period, orders, sales]);

  const maxValue = Math.max(
    ...report.sales.map((item) => Number(item.total || 0)),
    1
  );

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={23} color="#111" />
          </Pressable>
          <Text style={styles.title}>Sales Reports</Text>
          <Pressable onPress={load}>
            <Ionicons name="refresh" size={22} color="#111" />
          </Pressable>
        </View>

        <View style={styles.periods}>
          {["Daily", "Weekly", "Monthly"].map((item) => (
            <Pressable
              key={item}
              onPress={() => setPeriod(item)}
              style={[
                styles.periodButton,
                period === item && styles.periodActive,
              ]}
            >
              <Text style={[
                styles.periodText,
                period === item && styles.periodTextActive,
              ]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.revenueCard}>
          <Text style={styles.label}>TOTAL REVENUE</Text>
          <Text style={styles.revenue}>{money(report.revenue)}</Text>
          <Text style={styles.caption}>{period} Report</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Ionicons name="receipt-outline" size={21} color="#111" />
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{report.orders}</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cart-outline" size={21} color="#111" />
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={styles.statValue}>{report.sales.length}</Text>
          </View>
        </View>

        <Text style={styles.section}>Sales Summary</Text>

        <View style={styles.chartCard}>
          {report.sales.length === 0 ? (
            <Text style={styles.empty}>No sales data for this period.</Text>
          ) : (
            <View style={styles.chart}>
              {report.sales.slice(-7).map((sale, index) => {
                const amount = Number(sale.total || 0);
                const height = Math.max((amount / maxValue) * 130, 8);

                return (
                  <View style={styles.barColumn} key={sale.id || index}>
                    <Text style={styles.barAmount}>
                      {Math.round(amount)}
                    </Text>
                    <View style={[styles.bar, { height }]} />
                    <Text style={styles.barLabel}>
                      {sale.date
                        ? new Date(sale.date).toLocaleDateString("en-PH", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Sale"}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <Text style={styles.section}>Report Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Report Period</Text>
            <Text style={styles.detailValue}>{period}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Orders</Text>
            <Text style={styles.detailValue}>{report.orders}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Revenue</Text>
            <Text style={styles.detailValue}>{money(report.revenue)}</Text>
          </View>
        </View>
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
    marginBottom: 22,
  },
  title: { fontSize: 20, fontWeight: "900", color: "#111" },
  periods: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 5,
    marginBottom: 18,
  },
  periodButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 9,
  },
  periodActive: { backgroundColor: "#111" },
  periodText: { color: "#777", fontSize: 12, fontWeight: "800" },
  periodTextActive: { color: "#fff" },
  revenueCard: {
    backgroundColor: "#111",
    padding: 21,
    borderRadius: 15,
    marginBottom: 13,
  },
  label: { color: "#ccc", fontSize: 10, fontWeight: "800" },
  revenue: { color: "#fff", fontSize: 27, fontWeight: "900", marginTop: 9 },
  caption: { color: "#aaa", fontSize: 11, marginTop: 5 },
  stats: { flexDirection: "row", gap: 11, marginBottom: 22 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 13,
  },
  statLabel: { fontSize: 11, color: "#777", marginTop: 8 },
  statValue: { fontSize: 21, fontWeight: "900", color: "#111", marginTop: 4 },
  section: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111",
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 13,
    marginBottom: 20,
    minHeight: 190,
    justifyContent: "center",
  },
  chart: {
    height: 160,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 8,
  },
  barColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  barAmount: { fontSize: 8, color: "#777", marginBottom: 4 },
  bar: { width: "70%", backgroundColor: "#111", borderRadius: 5 },
  barLabel: { fontSize: 9, color: "#777", marginTop: 6 },
  empty: { textAlign: "center", color: "#888", padding: 20 },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 13,
    paddingHorizontal: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: { color: "#777", fontSize: 12 },
  detailValue: { color: "#111", fontSize: 12, fontWeight: "900" },
});