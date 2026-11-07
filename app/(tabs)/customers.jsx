import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function CustomersScreen() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem("user");

      if (!saved || JSON.parse(saved).role?.toLowerCase() !== "admin") {
        router.replace("/login");
        return;
      }

      const users = JSON.parse(
        (await AsyncStorage.getItem("users")) || "[]"
      );

      setCustomers(
        users.filter(
          user => user.role?.toLowerCase() === "customer"
        )
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = customers.filter(customer =>
    `${customer.name || ""} ${customer.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openDetails = (customer) => {
    router.push({
      pathname: "/(tabs)/customer-details",
      params: {
        email: customer.email || "",
        id: String(customer.id || customer.userId || ""),
      },
    });
  };

  const renderCustomer = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => openDetails(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.name || "C").charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.customerInfo}>
        <Text style={styles.name}>
          {item.name || "Unnamed Customer"}
        </Text>

        <Text style={styles.email}>
          {item.email || "No email"}
        </Text>

        <Text style={styles.status}>● Active</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>
          Registered NOIR accounts
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.search}
          placeholder="Search customer..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.countCard}>
        <Text style={styles.countLabel}>
          TOTAL CUSTOMERS
        </Text>

        <Text style={styles.count}>
          {customers.length}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#111"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, index) =>
            item.email || String(index)
          }
          renderItem={renderCustomer}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No customers found.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },

  header: {
    padding: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: "900",
    color: "#111",
  },

  subtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  searchBox: {
    marginHorizontal: 18,
    backgroundColor: "#fff",
    borderRadius: 14,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  searchIcon: {
    fontSize: 23,
    color: "#555",
  },

  search: {
    flex: 1,
    paddingLeft: 10,
    color: "#111",
  },

  countCard: {
    backgroundColor: "#111",
    margin: 18,
    padding: 20,
    borderRadius: 16,
  },

  countLabel: {
    color: "#ccc",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  count: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 5,
  },

  list: {
    paddingHorizontal: 18,
    paddingBottom: 25,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 25,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  customerInfo: {
    flex: 1,
  },

  name: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },

  email: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },

  status: {
    fontSize: 10,
    color: "#23834A",
    marginTop: 5,
  },

  arrow: {
    fontSize: 27,
    color: "#888",
  },

  empty: {
    textAlign: "center",
    padding: 30,
    color: "#777",
  },
});