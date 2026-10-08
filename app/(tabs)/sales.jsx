import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppCard } from "../../components/AppCard.jsx";
import ScreenHeader from "../../components/ScreenHeader.jsx";
import { colors } from "../../constants/theme";
import { getSales, money } from "../../lib/store";

export default function SalesScreen() {
  const [sales, setSales] = useState([]);

  useFocusEffect(
    useCallback(() => {
      getSales()
        .then(setSales)
        .catch(() => setSales([]));
    }, [])
  );

  const total = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Sales"
          subtitle="Your recorded store transactions"
        />

        {/* SUMMARY */}
        <View style={styles.row}>
          <AppCard style={styles.stat}>
            <Text style={styles.label}>TOTAL REVENUE</Text>
            <Text style={styles.value}>{money(total)}</Text>
          </AppCard>

          <AppCard style={styles.stat}>
            <Text style={styles.label}>ORDERS</Text>
            <Text style={styles.value}>{sales.length}</Text>
          </AppCard>
        </View>

        {/* TRANSACTIONS */}
        <Text style={styles.section}>RECENT TRANSACTIONS</Text>

        {sales.map((sale) => (
          <AppCard key={sale.id} style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.name}>
                {sale.productName || "Product"}
              </Text>

              <Text style={styles.date}>
                {sale.date
                  ? new Date(sale.date).toLocaleString()
                  : "No date"}
              </Text>

              <Text style={styles.qty}>
                Quantity: {sale.quantity || 1}
              </Text>
            </View>

            <Text style={styles.amount}>
              {money(sale.total || 0)}
            </Text>
          </AppCard>
        ))}

        {/* EMPTY SALES */}
        {!sales.length && (
          <AppCard>
            <Text style={styles.empty}>
              No sales recorded yet.
            </Text>

            <Text style={styles.hint}>
              Completed purchases will appear here.
            </Text>
          </AppCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },

  stat: {
    flex: 1,
  },

  label: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#64748B",
  },

  value: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 8,
  },

  section: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#F59E0B",
    marginBottom: 11,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
  },

  date: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },

  qty: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },

  amount: {
    fontSize: 15,
    fontWeight: "900",
    color: "#16A34A",
  },

  empty: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  hint: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
});