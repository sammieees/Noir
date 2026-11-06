
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomersScreen() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const loggedIn = await AsyncStorage.getItem("loggedIn");

      // Check if user is logged in
      if (!savedUser || loggedIn !== "true") {
        router.replace("/login");
        return;
      }

      const currentUser = JSON.parse(savedUser);

      // Only Admin can access this page
      if (currentUser.role?.toLowerCase() !== "admin") {
        router.replace("/(tabs)/products");
        return;
      }

      const users = JSON.parse(
        (await AsyncStorage.getItem("users")) || "[]"
      );

      // Get customer accounts only
      const customerList = users.filter(
        (user) => user.role?.toLowerCase() === "customer"
      );

      setCustomers(customerList);

    } catch (error) {
      console.log("CUSTOMER LOAD ERROR:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers])
  );

  const renderCustomer = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.name || "C").charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>
          {item.name || "Unnamed Customer"}
        </Text>

        <Text style={styles.email}>
          {item.email || "No email"}
        </Text>

        <Text style={styles.number}>
          CUSTOMER #{index + 1}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>
          Registered NOIR accounts
        </Text>
      </View>

      <View style={styles.countCard}>
        <Text style={styles.countLabel}>TOTAL CUSTOMERS</Text>
        <Text style={styles.count}>{customers.length}</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#111111" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item, index) =>
            item.email || String(index)
          }
          renderItem={renderCustomer}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>
                No customers yet
              </Text>

              <Text style={styles.emptyText}>
                Registered customer accounts will appear here.
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
    backgroundColor: "#F4F4F4",
  },
  header: {
    padding: 20,
    paddingTop: 25,
  },
  title: {
    fontSize: 27,
    fontWeight: "900",
    color: "#111",
  },
  subtitle: {
    color: "#777",
    fontSize: 12,
    marginTop: 5,
  },
  countCard: {
    marginHorizontal: 20,
    backgroundColor: "#111",
    borderRadius: 13,
    padding: 20,
    marginBottom: 15,
  },
  countLabel: {
    color: "#AAA",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  count: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 8,
  },
  list: {
    padding: 20,
    paddingTop: 5,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
  },
  info: {
    flex: 1,
    marginLeft: 13,
  },
  name: {
    color: "#111",
    fontWeight: "900",
    fontSize: 14,
  },
  email: {
    color: "#777",
    fontSize: 11,
    marginTop: 4,
  },
  number: {
    color: "#999",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 5,
  },
  empty: {
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  emptyTitle: {
    fontWeight: "900",
    color: "#111",
  },
  emptyText: {
    color: "#888",
    fontSize: 11,
    textAlign: "center",
    marginTop: 7,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#777",
    marginTop: 10,
    fontSize: 12,
  },
});
