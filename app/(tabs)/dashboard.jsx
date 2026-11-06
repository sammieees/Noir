
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

export default function AdminDashboard() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [adminName, setAdminName] = useState("NOIR Admin");

  // Check account and load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const loggedIn = await AsyncStorage.getItem("loggedIn");

      if (!savedUser || loggedIn !== "true") {
        router.replace("/login");
        return;
      }

      const currentUser = JSON.parse(savedUser);

      // Only Admin can access this dashboard
      if (currentUser.role?.toLowerCase() !== "admin") {
        router.replace("/(tabs)/products");
        return;
      }

      const productData = await getProducts();
      const salesData = await getSales();

      const usersData = JSON.parse(
        (await AsyncStorage.getItem("users")) || "[]"
      );

      setProducts(productData);
      setSales(salesData);

      setCustomers(
        usersData.filter(
          (user) => user.role?.toLowerCase() !== "admin"
        )
      );

      setAdminName(currentUser.name || "NOIR Admin");

    } catch (error) {
      console.log("DASHBOARD ERROR:", error);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  // Dashboard calculations
  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.total || 0),
    0
  );

  const lowStock = products.filter(
    (product) => Number(product.stock || 0) <= 5
  );

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  const StatCard = ({ title, value, subtitle }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>NOIR</Text>
            <Text style={styles.adminLabel}>ADMIN DASHBOARD</Text>
          </View>
        </View>

        {/* WELCOME */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Welcome back,</Text>
          <Text style={styles.adminName}>{adminName}</Text>
          <Text style={styles.welcomeSubtitle}>
            Here is your store overview.
          </Text>
        </View>

        {/* STORE OVERVIEW */}
        <Text style={styles.sectionTitle}>STORE OVERVIEW</Text>

        <View style={styles.grid}>
          <StatCard
            title="TOTAL PRODUCTS"
            value={products.length}
            subtitle="Products in catalog"
          />

          <StatCard
            title="TOTAL SALES"
            value={sales.length}
            subtitle="Recorded transactions"
          />

          <StatCard
            title="TOTAL REVENUE"
            value={money(totalRevenue)}
            subtitle="Recorded sales value"
          />

          <StatCard
            title="CUSTOMERS"
            value={customers.length}
            subtitle="Registered accounts"
          />

          <StatCard
            title="TOTAL STOCK"
            value={totalStock}
            subtitle="Available pieces"
          />

          <StatCard
            title="LOW STOCK"
            value={lowStock.length}
            subtitle="Products with 5 or fewer"
          />
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/inventory")}
          >
            <Text style={styles.actionTitle}>Manage Products</Text>
            <Text style={styles.actionSubtitle}>
              Add, edit, and delete products
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/sales")}
          >
            <Text style={styles.actionTitle}>View Sales</Text>
            <Text style={styles.actionSubtitle}>
              Check recorded transactions
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/customers")}
          >
            <Text style={styles.actionTitle}>Manage Customers</Text>
            <Text style={styles.actionSubtitle}>
              View registered customers
            </Text>
          </Pressable>
        </View>

        {/* LOW STOCK ALERTS */}
        <View style={styles.lowStockHeader}>
          <Text style={styles.sectionTitle}>LOW STOCK ALERTS</Text>
          <Text style={styles.warningCount}>
            {lowStock.length} ITEMS
          </Text>
        </View>

        {lowStock.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              All products have enough stock.
            </Text>
          </View>
        ) : (
          lowStock.map((product) => (
            <View key={product.id} style={styles.stockCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stockName}>
                  {product.name}
                </Text>

                <Text style={styles.stockCategory}>
                  {product.category || "General"}
                </Text>
              </View>

              <Text style={styles.stockNumber}>
                {product.stock} left
              </Text>
            </View>
          ))
        )}

        {/* RECENT TRANSACTIONS */}
        <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>

        {sales.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No transactions recorded yet.
            </Text>
          </View>
        ) : (
          sales.slice(-5).reverse().map((sale) => (
            <View key={sale.id} style={styles.saleCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.saleName}>
                  {sale.productName || "Product"}
                </Text>

                <Text style={styles.saleDate}>
                  {sale.date
                    ? new Date(sale.date).toLocaleDateString()
                    : "No date"}
                </Text>
              </View>

              <Text style={styles.saleAmount}>
                {money(sale.total)}
              </Text>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  brand: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 5,
    color: "#111",
  },

  adminLabel: {
    fontSize: 10,
    color: "#777",
    letterSpacing: 2,
    marginTop: 4,
    fontWeight: "800",
  },

  welcome: {
    backgroundColor: "#111",
    padding: 22,
    borderRadius: 16,
    marginBottom: 25,
  },

  welcomeTitle: {
    color: "#AAA",
    fontSize: 14,
  },

  adminName: {
    color: "#FFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 5,
  },

  welcomeSubtitle: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 8,
  },

  sectionTitle: {
    color: "#111",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 13,
    marginTop: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 25,
  },

  statCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  statTitle: {
    color: "#777",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  statValue: {
    color: "#111",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },

  statSubtitle: {
    color: "#888",
    fontSize: 10,
    marginTop: 5,
  },

  actions: {
    gap: 10,
    marginBottom: 25,
  },

  actionButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 17,
    borderRadius: 12,
  },

  actionTitle: {
    color: "#111",
    fontSize: 14,
    fontWeight: "900",
  },

  actionSubtitle: {
    color: "#777",
    fontSize: 11,
    marginTop: 5,
  },

  lowStockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  warningCount: {
    color: "#B45309",
    fontSize: 10,
    fontWeight: "900",
  },

  stockCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  stockName: {
    color: "#111",
    fontWeight: "800",
    fontSize: 13,
  },

  stockCategory: {
    color: "#888",
    fontSize: 11,
    marginTop: 4,
  },

  stockNumber: {
    color: "#B45309",
    fontWeight: "900",
    fontSize: 12,
  },

  emptyCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },

  emptyText: {
    color: "#777",
    fontSize: 12,
    textAlign: "center",
  },

  saleCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  saleName: {
    color: "#111",
    fontSize: 13,
    fontWeight: "800",
  },

  saleDate: {
    color: "#888",
    fontSize: 10,
    marginTop: 4,
  },

  saleAmount: {
    color: "#111",
    fontWeight: "900",
    fontSize: 13,
  },
});
