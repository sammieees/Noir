import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getOrders, money } from "../../lib/store";

export default function CustomerDetailsScreen() {
  const router = useRouter();
  const { email, id } = useLocalSearchParams();

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);

      const savedUser = await AsyncStorage.getItem("user");

      if (
        !savedUser ||
        JSON.parse(savedUser).role?.toLowerCase() !== "admin"
      ) {
        router.replace("/login");
        return;
      }

      const users = JSON.parse(
        (await AsyncStorage.getItem("users")) || "[]"
      );

      const selected = users.find(user => {
        const emailMatch =
          email &&
          String(user.email || "").toLowerCase() ===
            String(email).toLowerCase();

        const idMatch =
          id &&
          String(user.id || user.userId || "") === String(id);

        return emailMatch || idMatch;
      });

      if (!selected) {
        setCustomer(null);
        return;
      }

      setCustomer(selected);

      const allOrders = await getOrders();

      const customerOrders = allOrders.filter(order => {
        const emailMatch =
          selected.email &&
          order.customerEmail &&
          String(order.customerEmail).toLowerCase() ===
            String(selected.email).toLowerCase();

        const idMatch =
          (selected.id || selected.userId) &&
          order.customerId &&
          String(order.customerId) ===
            String(selected.id || selected.userId);

        const nameMatch =
          selected.name &&
          order.customerName &&
          String(order.customerName).toLowerCase() ===
            String(selected.name).toLowerCase();

        return emailMatch || idMatch || nameMatch;
      });

      setOrders(customerOrders.reverse());

    } catch (error) {
      console.log("CUSTOMER DETAILS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, [email, id, router]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails])
  );

  const totalSpent = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const totalPurchases = orders.length;

  const formatDate = date => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Date unavailable";
    }

    return parsed.toLocaleDateString();
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>

      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>
          {value || "Not provided"}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={styles.loadingText}>
          Loading customer details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={styles.notFound}>
          Customer not found.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Customer Details
          </Text>
        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(customer.name || "C")
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.customerName}>
              {customer.name || "Unnamed Customer"}
            </Text>

            <Text style={styles.customerEmail}>
              {customer.email || "No email"}
            </Text>

            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>
                ● Active Account
              </Text>
            </View>
          </View>
        </View>

        {/* PERSONAL INFORMATION */}

        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <View style={styles.card}>
          <InfoRow
            icon="♟"
            label="Full Name"
            value={customer.name || customer.fullName}
          />

          <View style={styles.divider} />

          <InfoRow
            icon="✉"
            label="Email Address"
            value={customer.email}
          />

          <View style={styles.divider} />

          <InfoRow
            icon="☎"
            label="Contact Number"
            value={
              customer.contactNumber ||
              customer.phone ||
              customer.phoneNumber
            }
          />

          <View style={styles.divider} />

          <InfoRow
            icon="⌖"
            label="Delivery Address"
            value={
              customer.deliveryAddress ||
              customer.address
            }
          />
        </View>

        {/* ACCOUNT SUMMARY */}

        <Text style={styles.sectionTitle}>
          Account Summary
        </Text>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>▣</Text>
            <Text style={styles.summaryLabel}>
              Total Purchases
            </Text>
            <Text style={styles.summaryValue}>
              {totalPurchases}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>₱</Text>
            <Text style={styles.summaryLabel}>
              Total Spent
            </Text>
            <Text style={styles.summaryValue}>
              {money(totalSpent)}
            </Text>
          </View>
        </View>

        {/* ORDER HISTORY */}

        <View style={styles.orderHeader}>
          <Text style={styles.sectionTitle}>
            Order History
          </Text>

          <Text style={styles.orderCount}>
            {orders.length} Orders
          </Text>
        </View>

        {orders.length > 0 ? (
          orders.map((order, index) => (
            <View
              key={order.id || index}
              style={styles.orderCard}
            >
              <View style={styles.orderTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderNumber}>
                    #{order.id || `ORDER-${index + 1}`}
                  </Text>

                  <Text style={styles.orderDate}>
                    {formatDate(order.date)}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {order.status || "Completed"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {(order.items || []).map((item, itemIndex) => (
                <View
                  key={item.id || itemIndex}
                  style={styles.productRow}
                >
                  <View style={styles.productIcon}>
                    <Text style={styles.productIconText}>
                      ▣
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>
                      {item.name || item.productName || "Product"}
                    </Text>

                    <Text style={styles.productQuantity}>
                      Quantity: {item.quantity || 1}
                    </Text>
                  </View>

                  <Text style={styles.productPrice}>
                    {money(
                      Number(item.price || 0) *
                      Number(item.quantity || 1)
                    )}
                  </Text>
                </View>
              ))}

              {(!order.items || order.items.length === 0) && (
                <Text style={styles.productName}>
                  {order.productName || "Purchased items"}
                </Text>
              )}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Total Amount
                </Text>

                <Text style={styles.totalValue}>
                  {money(order.total)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>▣</Text>

            <Text style={styles.emptyTitle}>
              No Orders Yet
            </Text>

            <Text style={styles.emptyText}>
              This customer has no recorded purchases.
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F7",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
  },

  notFound: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 12,
  },

  backIcon: {
    width: 38,
    height: 38,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  backArrow: {
    fontSize: 29,
    color: "#111",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
  },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 15,
    elevation: 2,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 40,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
  },

  profileInfo: {
    flex: 1,
  },

  customerName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111",
  },

  customerEmail: {
    fontSize: 12,
    color: "#777",
    marginTop: 5,
  },

  activeBadge: {
    backgroundColor: "#DDF5E4",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },

  activeText: {
    color: "#25834A",
    fontSize: 10,
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
    marginBottom: 12,
    marginTop: 5,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 17,
    marginBottom: 20,
    elevation: 1,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    gap: 13,
  },

  infoIcon: {
    fontSize: 19,
    color: "#111",
    width: 25,
    textAlign: "center",
  },

  infoText: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 13,
    color: "#111",
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 7,
  },

  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    elevation: 1,
  },

  summaryIcon: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
  },

  summaryLabel: {
    fontSize: 11,
    color: "#777",
    marginTop: 10,
  },

  summaryValue: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111",
    marginTop: 5,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderCount: {
    fontSize: 11,
    color: "#777",
    marginBottom: 12,
  },

  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },

  orderTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  orderNumber: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111",
  },

  orderDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 5,
  },

  statusBadge: {
    backgroundColor: "#E5F5E9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: "#25834A",
    fontSize: 10,
    fontWeight: "800",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },

  productIcon: {
    width: 43,
    height: 43,
    backgroundColor: "#F1F1F1",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  productIconText: {
    fontSize: 20,
    color: "#111",
  },

  productName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111",
  },

  productQuantity: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },

  productPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },

  totalLabel: {
    fontSize: 12,
    color: "#777",
  },

  totalValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111",
  },

  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 35,
    color: "#888",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 6,
  },

  backButton: {
    backgroundColor: "#111",
    padding: 13,
    borderRadius: 10,
    marginTop: 15,
  },

  backText: {
    color: "#fff",
    fontWeight: "bold",
  },
});