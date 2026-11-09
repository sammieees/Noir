import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrders, money } from "../lib/store";

const isValid = (o) =>
  String(o.status || "Pending").toLowerCase() !== "cancelled";

const isRecordedSale = (o) =>
  ["paid", "completed"].includes(
    String(o.paymentStatus || "").toLowerCase()
  ) ||
  String(o.status || "").toLowerCase() === "delivered";

export default function SalesReports() {
  const router = useRouter();

  const [period, setPeriod] = useState("Monthly");
  const [orders, setOrders] = useState([]);

  const load = useCallback(async () => {
    setOrders(await getOrders());
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
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }

    const selected = orders.filter((o) => {
      const d = new Date(o.date);

      return (
        isValid(o) &&
        !Number.isNaN(d.getTime()) &&
        d >= start &&
        d <= now
      );
    });

    const revenue = selected
      .filter(isRecordedSale)
      .reduce(
        (sum, o) => sum + Number(o.total || 0),
        0
      );

    const today = orders
      .filter(
        (o) =>
          isValid(o) &&
          isRecordedSale(o) &&
          new Date(o.date).toDateString() ===
            now.toDateString()
      )
      .reduce(
        (sum, o) => sum + Number(o.total || 0),
        0
      );

    const month = orders
      .filter((o) => {
        const d = new Date(o.date);

        return (
          isValid(o) &&
          isRecordedSale(o) &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce(
        (sum, o) => sum + Number(o.total || 0),
        0
      );

    const transactions = selected.filter(isRecordedSale);

    const best = {};

    transactions.forEach((o) =>
      (o.items || []).forEach((item) => {
        const key = item.name || "Product";

        best[key] =
          (best[key] || 0) +
          Number(item.quantity || 1);
      })
    );

    const history = [...transactions].sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    const chart = history.slice(0, 7).reverse();

    return {
      selected,
      revenue,
      today,
      month,
      transactions,
      best: Object.entries(best)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      history,
      chart
    };
  }, [period, orders]);

  const max = Math.max(
    ...report.chart.map((o) => Number(o.total || 0)),
    1
  );

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={23}
              color="#111"
            />
          </Pressable>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.title}>
              Sales Reports
            </Text>

            <Text style={styles.subtitle}>
              Recorded customer orders
            </Text>
          </View>

          <Pressable onPress={load}>
            <Ionicons
              name="refresh"
              size={21}
              color="#111"
            />
          </Pressable>
        </View>

        <View style={styles.periods}>
          {["Daily", "Weekly", "Monthly"].map((x) => (
            <Pressable
              key={x}
              onPress={() => setPeriod(x)}
              style={[
                styles.period,
                period === x && styles.active
              ]}
            >
              <Text
                style={[
                  styles.periodText,
                  period === x && styles.activeText
                ]}
              >
                {x}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.hero}>
          <Text style={styles.label}>
            {period.toUpperCase()} SALES
          </Text>

          <Text style={styles.revenue}>
            {money(report.revenue)}
          </Text>

          <Text style={styles.caption}>
            {report.transactions.length} paid/delivered transaction(s)
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.label}>
              TODAY'S SALES
            </Text>

            <Text style={styles.statValue}>
              {money(report.today)}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.label}>
              MONTHLY SALES
            </Text>

            <Text style={styles.statValue}>
              {money(report.month)}
            </Text>
          </View>
        </View>

        <Text style={styles.section}>
          Sales Chart
        </Text>

        <View style={styles.chartCard}>
          {report.chart.length === 0 ? (
            <Text style={styles.empty}>
              No recorded sales in this period.
            </Text>
          ) : (
            <View style={styles.chart}>
              {report.chart.map((o, i) => (
                <View
                  key={String(o.id || i)}
                  style={styles.barCol}
                >
                  <Text style={styles.barValue}>
                    {Math.round(Number(o.total || 0))}
                  </Text>

                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(
                          Number(o.total || 0) / max * 115,
                          7
                        )
                      }
                    ]}
                  />

                  <Text style={styles.barLabel}>
                    {new Date(o.date).toLocaleDateString(
                      "en-PH",
                      {
                        day: "numeric",
                        month: "short"
                      }
                    )}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.section}>
          Best-Selling Products
        </Text>

        <View style={styles.card}>
          {report.best.length === 0 ? (
            <Text style={styles.empty}>
              No product sales recorded.
            </Text>
          ) : (
            report.best.map(([name, qty], i) => (
              <View key={name} style={styles.row}>
                <View style={styles.rank}>
                  <Text style={styles.rankText}>
                    {i + 1}
                  </Text>
                </View>

                <Text style={styles.productName}>
                  {name}
                </Text>

                <Text style={styles.qty}>
                  {qty} sold
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.section}>
            Sales History
          </Text>

          <Text style={styles.muted}>
            {report.history.length} order(s)
          </Text>
        </View>

        <View style={styles.card}>
          {report.history.length === 0 ? (
            <Text style={styles.empty}>
              No sales history for this period.
            </Text>
          ) : (
            report.history.map((o, i) => (
              <View
                key={String(o.id || i)}
                style={styles.historyRow}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderId}>
                    #{o.id}
                  </Text>

                  <Text style={styles.date}>
                    {o.date
                      ? new Date(o.date).toLocaleString(
                          "en-PH",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          }
                        )
                      : "Date unavailable"}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.amount}>
                    {money(o.total)}
                  </Text>

                  <Text style={styles.status}>
                    {o.status || "Pending"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

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
    padding: 17,
    paddingBottom: 35
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20
  },
  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111"
  },
  subtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 3
  },
  periods: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 13,
    marginBottom: 14
  },
  period: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 9
  },
  active: {
    backgroundColor: "#111"
  },
  periodText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#777"
  },
  activeText: {
    color: "#fff"
  },
  hero: {
    backgroundColor: "#111",
    borderRadius: 17,
    padding: 19
  },
  label: {
    fontSize: 10,
    color: "#999",
    letterSpacing: 1,
    fontWeight: "800"
  },
  revenue: {
    fontSize: 27,
    fontWeight: "900",
    color: "#fff",
    marginTop: 8
  },
  caption: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 6
  },
  stats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 11
  },
  stat: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
    marginTop: 8
  },
  section: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
    marginTop: 22,
    marginBottom: 10
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 14,
    minHeight: 160,
    justifyContent: "center"
  },
  chart: {
    height: 140,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 5
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  bar: {
    width: "65%",
    backgroundColor: "#111",
    borderRadius: 5
  },
  barValue: {
    fontSize: 8,
    color: "#777",
    marginBottom: 5
  },
  barLabel: {
    fontSize: 8,
    color: "#888",
    marginTop: 6
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 14
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    gap: 10
  },
  rank: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center"
  },
  rankText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111"
  },
  productName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#222"
  },
  qty: {
    fontSize: 11,
    fontWeight: "800",
    color: "#555"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  muted: {
    fontSize: 10,
    color: "#999"
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1"
  },
  orderId: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111"
  },
  date: {
    fontSize: 10,
    color: "#999",
    marginTop: 4
  },
  amount: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111"
  },
  status: {
    fontSize: 10,
    color: "#777",
    marginTop: 4
  },
  empty: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    padding: 20
  }
});