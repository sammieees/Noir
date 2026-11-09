import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { getOrders, money, saveOrders } from "../../lib/store";

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : {};

      setCurrentUser(user);

      const allOrders = await getOrders();

      const email = String(user.email || "")
        .trim()
        .toLowerCase();

      const userId = String(user.id || user.userId || "");

      const customerName = String(
        user.name || user.fullName || ""
      ).trim().toLowerCase();

      const customerOrders = allOrders.filter((order) => {
        if (email && order.customerEmail) {
          return (
            String(order.customerEmail)
              .trim()
              .toLowerCase() === email
          );
        }

        if (userId && order.customerId) {
          return String(order.customerId) === userId;
        }

        return (
          customerName !== "" &&
          String(order.customerName || "")
            .trim()
            .toLowerCase() === customerName
        );
      });

      setOrders(customerOrders);
    } catch (error) {
      console.log("LOAD MY ORDERS ERROR:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    switch (String(status || "Pending").toLowerCase()) {
      case "pending":
        return styles.pending;

      case "confirmed":
        return styles.confirmed;

      case "processing":
        return styles.processing;

      case "shipped":
        return styles.shipped;

      case "delivered":
        return styles.delivered;

      case "cancelled":
        return styles.cancelled;

      default:
        return styles.pending;
    }
  };

  const canRequestCancellation = (order) => {
    const status = String(order.status || "Pending").toLowerCase();

    return ["pending", "confirmed", "processing"].includes(status);
  };

  const openCancellation = (order) => {
    setSelectedOrder(order);
    setReason("");
    setModalVisible(true);
  };

  const submitCancellation = () => {
    if (!reason.trim()) {
      Alert.alert(
        "Reason Required",
        "Please enter your reason for requesting cancellation."
      );
      return;
    }

    Alert.alert(
      "Submit Cancellation Request",
      "Are you sure you want to send this cancellation request to the Admin?",
      [
        {
          text: "Go Back",
          style: "cancel",
        },
        {
          text: "Submit Request",
          onPress: saveCancellationRequest,
        },
      ]
    );
  };

  const saveCancellationRequest = async () => {
    if (!selectedOrder || saving) return;

    try {
      setSaving(true);

      const allOrders = await getOrders();

      const updatedOrders = allOrders.map((order) => {
        if (String(order.id) !== String(selectedOrder.id)) {
          return order;
        }

        return {
          ...order,

          cancellationRequest: {
            status: "Pending",
            reason: reason.trim(),
            requestedAt: new Date().toISOString(),
          },

          updatedAt: new Date().toISOString(),
        };
      });

      await saveOrders(updatedOrders);

      setModalVisible(false);
      setSelectedOrder(null);
      setReason("");

      await loadOrders();

      Alert.alert(
        "Request Submitted",
        "Your cancellation request has been sent to the Admin. Please wait for approval."
      );
    } catch (error) {
      console.log("CANCELLATION REQUEST ERROR:", error);

      Alert.alert(
        "Request Failed",
        "Unable to submit your request. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const getCancellationMessage = (request) => {
    if (!request) return "";

    switch (String(request.status || "").toLowerCase()) {
      case "pending":
        return "Your cancellation request is waiting for Admin approval.";

      case "approved":
        return "Your cancellation request has been approved.";

      case "rejected":
        return "Your cancellation request was rejected. Your order remains active.";

      default:
        return "";
    }
  };

  const renderOrder = ({ item }) => {
    const request = item.cancellationRequest;

    const hasRequest = Boolean(request);

    const requestStatus = String(
      request?.status || ""
    ).toLowerCase();

    const alreadyRequested = [
      "pending",
      "approved",
    ].includes(requestStatus);

    return (
      <View style={styles.orderCard}>
        {/* ORDER HEADER */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderInfo}>
            <Text style={styles.orderId}>ORDER ID</Text>

            <Text style={styles.orderNumber}>
              #{item.id}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              getStatusStyle(item.status),
            ]}
          >
            <Text style={styles.statusText}>
              {item.status || "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* PRODUCTS */}
        <Text style={styles.productsTitle}>
          Purchased Products
        </Text>

        {(item.items || []).map((product, index) => (
          <View
            key={`${product.id}-${product.size}-${index}`}
            style={styles.productRow}
          >
            {product.image ? (
              <Image
                source={
                  typeof product.image === "string"
                    ? { uri: product.image }
                    : product.image
                }
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>
                  NOIR
                </Text>
              </View>
            )}

            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {product.name}
              </Text>

              <Text style={styles.productDetails}>
                Size: {product.size || "N/A"}
              </Text>

              <Text style={styles.productDetails}>
                Quantity: {product.quantity || 1}
              </Text>

              <Text style={styles.productPrice}>
                {money(
                  Number(product.price || 0) *
                  Number(product.quantity || 1)
                )}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        {/* ORDER INFORMATION */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Order Date
          </Text>

          <Text style={styles.infoValue}>
            {formatDate(item.date)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Payment
          </Text>

          <Text style={styles.infoValue}>
            {item.paymentMethod || "Cash on Delivery"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Total Price
          </Text>

          <Text style={styles.totalPrice}>
            {money(item.total)}
          </Text>
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.addressContainer}>
          <Text style={styles.addressTitle}>
            Delivery Address
          </Text>

          <Text style={styles.addressText}>
            {item.deliveryAddress || "No address available"}
          </Text>
        </View>

        {/* CANCELLATION REQUEST STATUS */}
        {hasRequest && (
          <View style={styles.requestBox}>
            <Text style={styles.requestTitle}>
              Cancellation Request
            </Text>

            <Text
              style={[
                styles.requestStatus,
                requestStatus === "approved" &&
                  styles.approvedText,
                requestStatus === "rejected" &&
                  styles.rejectedText,
              ]}
            >
              {request.status || "Pending"}
            </Text>

            <Text style={styles.requestMessage}>
              {getCancellationMessage(request)}
            </Text>

            <Text style={styles.reasonLabel}>
              Your reason:
            </Text>

            <Text style={styles.reasonText}>
              {request.reason || "No reason provided."}
            </Text>
          </View>
        )}

        {/* REQUEST CANCELLATION */}
        {canRequestCancellation(item) &&
          !alreadyRequested && (
            <Pressable
              style={styles.cancelButton}
              onPress={() => openCancellation(item)}
            >
              <Text style={styles.cancelButtonText}>
                Request Cancellation
              </Text>
            </Pressable>
          )}

        {requestStatus === "pending" && (
          <View style={styles.waitingBox}>
            <Text style={styles.waitingText}>
              Waiting for Admin Approval
            </Text>
          </View>
        )}

        {requestStatus === "rejected" &&
          canRequestCancellation(item) && (
            <Pressable
              style={styles.cancelButton}
              onPress={() => openCancellation(item)}
            >
              <Text style={styles.cancelButtonText}>
                Submit New Request
              </Text>
            </Pressable>
          )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#111"
        />

        <Text style={styles.loadingText}>
          Loading your orders...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            My Orders
          </Text>

          <Text style={styles.subtitle}>
            Track your NOIR purchases
          </Text>
        </View>

        <Pressable onPress={loadOrders}>
          <Text style={styles.refreshText}>
            Refresh
          </Text>
        </Pressable>
      </View>

      {/* ORDERS LIST */}
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>

          <Text style={styles.emptyTitle}>
            No Orders Yet
          </Text>

          <Text style={styles.emptyText}>
            Your purchased products will appear here.
          </Text>

          <Link href="/(tabs)/products" asChild>
            <Pressable style={styles.shopButton}>
              <Text style={styles.shopButtonText}>
                START SHOPPING
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={loadOrders}
          refreshing={loading}
        />
      )}

      {/* CANCELLATION MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Request Cancellation
            </Text>

            <Text style={styles.modalSubtitle}>
              Order #{selectedOrder?.id}
            </Text>

            <Text style={styles.modalDescription}>
              Please tell us why you want to cancel this order.
              Your request will be reviewed by the Admin.
            </Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Enter your cancellation reason..."
              placeholderTextColor="#999"
              value={reason}
              onChangeText={setReason}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />

            <Text style={styles.characterCount}>
              {reason.length}/500
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.backButton}
                onPress={() => {
                  setModalVisible(false);
                  setReason("");
                }}
                disabled={saving}
              >
                <Text style={styles.backButtonText}>
                  Go Back
                </Text>
              </Pressable>

              <Pressable
                style={styles.submitButton}
                onPress={submitCancellation}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Submit Request
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },

  loadingText: {
    marginTop: 12,
    color: "#666",
  },

  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 23,
    fontWeight: "900",
    color: "#111",
  },

  subtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },

  refreshText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111",
  },

  list: {
    padding: 15,
    paddingBottom: 30,
  },

  orderCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 2,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderHeaderInfo: {
    gap: 4,
  },

  orderId: {
    fontSize: 9,
    fontWeight: "800",
    color: "#999",
    letterSpacing: 1,
  },

  orderNumber: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#333",
  },

  pending: {
    backgroundColor: "#fff0d2",
  },

  confirmed: {
    backgroundColor: "#e5f5e8",
  },

  processing: {
    backgroundColor: "#e9edff",
  },

  shipped: {
    backgroundColor: "#e5efff",
  },

  delivered: {
    backgroundColor: "#dff5e5",
  },

  cancelled: {
    backgroundColor: "#ffe5e5",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 13,
  },

  productsTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111",
    marginBottom: 10,
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },

  productImage: {
    width: 65,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#eee",
  },

  imagePlaceholder: {
    width: 65,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    fontWeight: "900",
    fontSize: 12,
    color: "#888",
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111",
  },

  productDetails: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
  },

  productPrice: {
    fontSize: 11,
    color: "#111",
    fontWeight: "800",
    marginTop: 5,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
    gap: 10,
  },

  infoLabel: {
    fontSize: 11,
    color: "#888",
  },

  infoValue: {
    fontSize: 11,
    color: "#333",
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },

  totalPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
  },

  addressContainer: {
    backgroundColor: "#f6f6f6",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  addressTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111",
    marginBottom: 5,
  },

  addressText: {
    fontSize: 11,
    color: "#666",
    lineHeight: 17,
  },

  cancelButton: {
    backgroundColor: "#111",
    padding: 13,
    borderRadius: 11,
    alignItems: "center",
    marginTop: 13,
  },

  cancelButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#fff",
  },

  requestBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 13,
    marginTop: 13,
    borderWidth: 1,
    borderColor: "#eee",
  },

  requestTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111",
  },

  requestStatus: {
    fontSize: 11,
    fontWeight: "900",
    color: "#a87514",
    marginTop: 7,
  },

  approvedText: {
    color: "#21834b",
  },

  rejectedText: {
    color: "#c33",
  },

  requestMessage: {
    fontSize: 10,
    color: "#666",
    lineHeight: 16,
    marginTop: 5,
  },

  reasonLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "800",
    marginTop: 10,
  },

  reasonText: {
    fontSize: 11,
    color: "#333",
    marginTop: 4,
    lineHeight: 17,
  },

  waitingBox: {
    backgroundColor: "#fff4dc",
    padding: 11,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  waitingText: {
    color: "#956500",
    fontSize: 10,
    fontWeight: "900",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111",
  },

  emptyText: {
    fontSize: 12,
    color: "#888",
    marginTop: 7,
    textAlign: "center",
  },

  shopButton: {
    backgroundColor: "#111",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 20,
  },

  shopButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111",
  },

  modalSubtitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#888",
    marginTop: 5,
  },

  modalDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 18,
    marginTop: 15,
    marginBottom: 12,
  },

  reasonInput: {
    height: 115,
    backgroundColor: "#f5f5f5",
    borderRadius: 11,
    padding: 12,
    fontSize: 12,
    color: "#111",
    borderWidth: 1,
    borderColor: "#eee",
  },

  characterCount: {
    fontSize: 9,
    color: "#999",
    textAlign: "right",
    marginTop: 5,
  },

  modalActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 18,
  },

  backButton: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  backButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#333",
  },

  submitButton: {
    flex: 1,
    backgroundColor: "#111",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  submitButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#fff",
  },
});
