import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    getOrders,
    money,
    saveOrders
} from "../../lib/store";

const STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered"
];

export default function AdminOrderDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [showStatuses, setShowStatuses] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const all = await getOrders();

    setOrder(
      all.find((o) => String(o.id) === String(id)) || null
    );
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = async (patch, message) => {
    if (!order || saving) return;

    try {
      setSaving(true);

      const all = await getOrders();

      const updated = all.map((o) =>
        String(o.id) === String(id)
          ? {
              ...o,
              ...patch,
              updatedAt: new Date().toISOString()
            }
          : o
      );

      await saveOrders(updated);

      setOrder(
        updated.find((o) => String(o.id) === String(id))
      );

      setShowStatuses(false);

      if (message) {
        Alert.alert("Updated", message);
      }
    } catch (e) {
      console.log("ORDER UPDATE ERROR:", e);

      Alert.alert(
        "Update failed",
        "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = (status) => {
    Alert.alert(
      "Confirm status update",
      `Change order ${order.id} to ${status}?`,
      [
        {
          text: "Keep Current",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: () =>
            persist(
              { status },
              `Order status is now ${status}. The customer's My Orders will show this update.`
            )
        }
      ]
    );
  };

  const cancellationAction = (approved) => {
    Alert.alert(
      approved
        ? "Approve cancellation?"
        : "Reject cancellation?",
      approved
        ? "This will mark the order as cancelled."
        : "This will keep the order active.",
      [
        {
          text: "Go Back",
          style: "cancel"
        },
        {
          text: approved ? "Approve" : "Reject",
          style: approved ? "destructive" : "default",
          onPress: () =>
            persist(
              approved
                ? {
                    status: "Cancelled",
                    cancellationRequest: {
                      ...(order.cancellationRequest || {}),
                      status: "Approved",
                      reviewedAt: new Date().toISOString()
                    }
                  }
                : {
                    cancellationRequest: {
                      ...(order.cancellationRequest || {}),
                      status: "Rejected",
                      reviewedAt: new Date().toISOString()
                    }
                  },
              approved
                ? "Cancellation approved."
                : "Cancellation request rejected."
            )
        }
      ]
    );
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={23}
              color="#111"
            />
          </Pressable>

          <Text style={styles.title}>
            Order Details
          </Text>

          <View />
        </View>

        <Text style={styles.empty}>
          Order not found.
        </Text>
      </SafeAreaView>
    );
  }

  const date = order.date ? new Date(order.date) : null;
  const items = order.items || [];
  const request = order.cancellationRequest;

  return (
    <SafeAreaView style={styles.page}>

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={23}
            color="#111"
          />
        </Pressable>

        <Text style={styles.title}>
          Order Details
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <Text style={styles.orderId}>
              #{order.id}
            </Text>

            <Text style={styles.status}>
              {order.status || "Pending"}
            </Text>
          </View>

          <Text style={styles.date}>
            {date && !Number.isNaN(date.getTime())
              ? date.toLocaleString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "Date unavailable"}
          </Text>

          <View style={styles.progress}>
            {STATUSES.map((s, i) => {
              const current = STATUSES.indexOf(
                order.status || "Pending"
              );

              const done = current >= i;

              return (
                <View key={s} style={styles.step}>
                  <View
                    style={[
                      styles.dot,
                      done && styles.dotActive
                    ]}
                  />

                  <Text
                    style={[
                      styles.stepText,
                      done && styles.stepTextActive
                    ]}
                  >
                    {s}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>
            Customer Information
          </Text>

          <Info
            icon="person-outline"
            value={order.customerName || "Customer"}
          />

          <Info
            icon="mail-outline"
            value={order.customerEmail || "No email provided"}
          />

          <Info
            icon="call-outline"
            value={order.contactNumber || "No contact number"}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>
            Ordered Products
          </Text>

          {items.map((item, i) => (
            <View
              key={`${item.id || item.name}-${i}`}
              style={styles.product}
            >
              {item.image ? (
                <Image
                  source={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image
                  }
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.productImage}>
                  <Ionicons
                    name="shirt-outline"
                    size={22}
                    color="#777"
                  />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>
                  {item.name || "Product"}
                </Text>

                <Text style={styles.productMeta}>
                  Size: {item.size || "N/A"}
                  {" · "}
                  Qty: {item.quantity || 1}
                </Text>

                <Text style={styles.productMeta}>
                  {money(item.price)}
                </Text>
              </View>

              <Text style={styles.price}>
                {money(
                  Number(item.price || 0) *
                  Number(item.quantity || 1)
                )}
              </Text>
            </View>
          ))}

          {items.length === 0 && (
            <Text style={styles.muted}>
              No item details recorded.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>
            Payment & Delivery
          </Text>

          <Info
            icon="card-outline"
            label="Payment Method"
            value={order.paymentMethod || "Not recorded"}
          />

          <Info
            icon="wallet-outline"
            label="Payment Status"
            value={
              order.paymentStatus ||
              (
                order.paymentMethod === "Cash on Delivery"
                  ? "Pay on delivery"
                  : "Not recorded"
              )
            }
          />

          <Info
            icon="location-outline"
            label="Delivery Address"
            value={order.deliveryAddress || "No address provided"}
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total Amount
            </Text>

            <Text style={styles.total}>
              {money(order.total)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>
            Update Status
          </Text>

          <Pressable
            style={styles.primary}
            onPress={() => setShowStatuses((v) => !v)}
            disabled={saving}
          >
            <Text style={styles.primaryText}>
              {showStatuses
                ? "Close Status Options"
                : "Update Status"}
            </Text>

            <Ionicons
              name={
                showStatuses
                  ? "chevron-up"
                  : "chevron-down"
              }
              color="#fff"
              size={17}
            />
          </Pressable>

          {showStatuses && (
            <View style={styles.statusOptions}>
              {STATUSES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => updateStatus(s)}
                  style={[
                    styles.statusOption,
                    order.status === s && styles.selected
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      order.status === s && styles.selectedText
                    ]}
                  >
                    {s}
                  </Text>

                  <Ionicons
                    name={
                      order.status === s
                        ? "checkmark-circle"
                        : "chevron-forward"
                    }
                    size={17}
                    color={
                      order.status === s ? "#fff" : "#888"
                    }
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {request && (
          <View style={styles.card}>
            <View style={styles.requestHeader}>
              <Text style={styles.section}>
                Cancellation Request
              </Text>

              <Text style={styles.requestState}>
                {request.status || "Pending Review"}
              </Text>
            </View>

            <Text style={styles.reasonLabel}>
              Customer's reason
            </Text>

            <Text style={styles.reason}>
              {request.reason ||
                request.cancellationReason ||
                "No reason was provided."}
            </Text>

            {String(request.status || "").toLowerCase() !==
              "approved" &&
              String(request.status || "").toLowerCase() !==
                "rejected" && (
                <View style={styles.actions}>
                  <Pressable
                    style={styles.reject}
                    onPress={() => cancellationAction(false)}
                  >
                    <Text style={styles.rejectText}>
                      Reject
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.approve}
                    onPress={() => cancellationAction(true)}
                  >
                    <Text style={styles.approveText}>
                      Approve Cancellation
                    </Text>
                  </Pressable>
                </View>
              )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ icon, label, value }) {
  return (
    <View style={styles.info}>
      <Ionicons
        name={icon}
        size={17}
        color="#555"
      />

      <View style={{ flex: 1 }}>
        {label ? (
          <Text style={styles.infoLabel}>
            {label}
          </Text>
        ) : null}

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  header: {
    height: 54,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111"
  },
  content: {
    padding: 15,
    paddingBottom: 35
  },
  hero: {
    backgroundColor: "#111",
    borderRadius: 17,
    padding: 17,
    marginBottom: 12
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  orderId: {
    fontSize: 21,
    fontWeight: "900",
    color: "#fff"
  },
  status: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111",
    backgroundColor: "#fff",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 15,
    overflow: "hidden"
  },
  date: {
    fontSize: 11,
    color: "#bbb",
    marginTop: 7
  },
  progress: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22
  },
  step: {
    alignItems: "center",
    flex: 1
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#888",
    backgroundColor: "#111"
  },
  dotActive: {
    backgroundColor: "#fff",
    borderColor: "#fff"
  },
  stepText: {
    fontSize: 8,
    color: "#888",
    marginTop: 7,
    textAlign: "center"
  },
  stepTextActive: {
    color: "#fff",
    fontWeight: "800"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12
  },
  section: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111",
    marginBottom: 12
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginVertical: 7
  },
  infoLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 2
  },
  infoValue: {
    fontSize: 12,
    color: "#222",
    fontWeight: "600",
    flexShrink: 1
  },
  product: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1"
  },
  productImage: {
    width: 48,
    height: 52,
    borderRadius: 9,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    resizeMode: "cover"
  },
  productName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111"
  },
  productMeta: {
    fontSize: 10,
    color: "#888",
    marginTop: 4
  },
  price: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111"
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 13,
    marginTop: 9,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111"
  },
  total: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111"
  },
  primary: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },
  primaryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900"
  },
  statusOptions: {
    marginTop: 10,
    gap: 7
  },
  statusOption: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 11,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  selected: {
    backgroundColor: "#111",
    borderColor: "#111"
  },
  optionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333"
  },
  selectedText: {
    color: "#fff"
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  requestState: {
    fontSize: 10,
    fontWeight: "800",
    color: "#555"
  },
  reasonLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "800",
    marginBottom: 5
  },
  reason: {
    fontSize: 12,
    color: "#333",
    lineHeight: 18
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  reject: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 12,
    padding: 12,
    alignItems: "center"
  },
  rejectText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#111"
  },
  approve: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 12,
    alignItems: "center"
  },
  approveText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fff"
  },
  muted: {
    color: "#888",
    fontSize: 11
  },
  empty: {
    textAlign: "center",
    padding: 35,
    color: "#888"
  }
});