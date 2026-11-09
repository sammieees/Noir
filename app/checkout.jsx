
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  completeSale,
  getOrders,
  money,
  saveOrders,
} from "../lib/store";
import { useCart } from "./CartContext";

const PAYMENT_METHODS = [
  {
    id: "Cash on Delivery",
    name: "Cash on Delivery",
    description: "Pay when your order arrives.",
    icon: "cash-outline",
    label: "COD",
  },
  {
    id: "GCash",
    name: "GCash",
    description: "Pay using your GCash account.",
    icon: "phone-portrait-outline",
    label: "E-WALLET",
  },
  {
    id: "Maya",
    name: "Maya",
    description: "Pay using your Maya account.",
    icon: "wallet-outline",
    label: "E-WALLET",
  },
  {
    id: "Bank Transfer",
    name: "Bank Transfer",
    description: "Pay through your preferred bank.",
    icon: "business-outline",
    label: "BANK",
  },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, total, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [placingOrder, setPlacingOrder] = useState(false);

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add products before checkout.");
      return;
    }

    if (!customerName.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }

    const phone = contactNumber.replace(/[\s-]/g, "");

    if (!/^(09\d{9}|\+639\d{9}|639\d{9})$/.test(phone)) {
      Alert.alert(
        "Invalid Contact Number",
        "Please enter a valid Philippine mobile number."
      );
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert("Required", "Please enter your complete delivery address.");
      return;
    }

    Alert.alert(
      "Confirm Your Order",
      `Total: ${money(total)}\nPayment Method: ${paymentMethod}\n\nDo you want to place your order?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Place Order",
          onPress: submitOrder,
        },
      ]
    );
  };

  const submitOrder = async () => {
    if (placingOrder) return;

    try {
      setPlacingOrder(true);

      const savedUser = await AsyncStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : {};

      const order = {
        id: `NOIR-${Date.now()}`,

        customerId: user.id || user.userId || user.email || null,

        customerEmail: String(user.email || "")
          .trim()
          .toLowerCase(),

        customerName: customerName.trim(),
        contactNumber: contactNumber.trim(),
        deliveryAddress: deliveryAddress.trim(),

        paymentMethod: paymentMethod,
        paymentStatus:
          paymentMethod === "Cash on Delivery"
            ? "Pay on Delivery"
            : "Pending",

        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          size: item.size,
          quantity: Number(item.quantity),
          image: item.image || null,
        })),

        total: Number(total),
        status: "Pending",
        date: new Date().toISOString(),
      };

      // UPDATE INVENTORY AND SALES
      await completeSale(cart);

      // SAVE CUSTOMER ORDER
      const existingOrders = await getOrders();

      await saveOrders([order, ...existingOrders]);

      clearCart();

      Alert.alert(
        "Order Placed Successfully!",
        `Thank you for shopping at NOIR!\n\nOrder ID: ${order.id}\nTotal: ${money(total)}\nPayment: ${paymentMethod}${
          paymentMethod === "Cash on Delivery"
            ? "\nPay when your order arrives."
            : "\nPayment is pending. Please follow the store's payment instructions."
        }`,
        [
          {
            text: "View My Orders",
            onPress: () => router.replace("/(tabs)/orders"),
          },
          {
            text: "Continue Shopping",
            onPress: () => router.replace("/(tabs)/products"),
          },
        ]
      );
    } catch (error) {
      console.log("PLACE ORDER ERROR:", error);

      Alert.alert(
        "Order Failed",
        "Something went wrong while placing your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="bag-outline" size={55} color="#999999" />

        <Text style={styles.emptyTitle}>YOUR CART IS EMPTY</Text>

        <Text style={styles.emptyText}>
          Add products to your cart before checkout.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)/products")}
        >
          <Text style={styles.primaryButtonText}>SHOP NOW</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.backText}>‹ Back</Text>
            </Pressable>

            <Text style={styles.logo}>NOIR</Text>
          </View>

          <Text style={styles.pageTitle}>CHECKOUT</Text>

          <Text style={styles.subtitle}>
            Complete your details to place your order.
          </Text>

          {/* CUSTOMER INFORMATION */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Customer Information</Text>

            <Text style={styles.label}>Full Name</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#999999"
              value={customerName}
              onChangeText={setCustomerName}
              editable={!placingOrder}
            />

            <Text style={styles.label}>Contact Number</Text>

            <TextInput
              style={styles.input}
              placeholder="09XXXXXXXXX"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
              maxLength={13}
              editable={!placingOrder}
            />

            <Text style={styles.label}>Delivery Address</Text>

            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="House number, street, barangay, city"
              placeholderTextColor="#999999"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              textAlignVertical="top"
              editable={!placingOrder}
            />
          </View>

          {/* ORDER SUMMARY */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            {cart.map((item) => (
              <View key={item.cartId} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>

                  <Text style={styles.itemDetails}>
                    Size: {item.size} | Qty: {item.quantity}
                  </Text>
                </View>

                <Text style={styles.itemPrice}>
                  {money(Number(item.price) * Number(item.quantity))}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>

              <Text style={styles.totalAmount}>{money(total)}</Text>
            </View>
          </View>

          {/* PAYMENT METHODS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            <Text style={styles.paymentSubtitle}>
              Choose how you want to pay for your order.
            </Text>

            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method.id;

              return (
                <Pressable
                  key={method.id}
                  style={[
                    styles.paymentOption,
                    isSelected && styles.selectedPaymentOption,
                  ]}
                  onPress={() => setPaymentMethod(method.id)}
                  disabled={placingOrder}
                >
                  <View
                    style={[
                      styles.paymentIcon,
                      isSelected && styles.selectedPaymentIcon,
                    ]}
                  >
                    <Ionicons
                      name={method.icon}
                      size={23}
                      color={isSelected ? "#ffffff" : "#333333"}
                    />
                  </View>

                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>
                      {method.name}
                    </Text>

                    <Text style={styles.paymentDescription}>
                      {method.description}
                    </Text>
                  </View>

                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentLabel}>
                      {method.label}
                    </Text>

                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {/* SELECTED PAYMENT INFORMATION */}
            <View style={styles.paymentNotice}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color="#555555"
              />

              <Text style={styles.paymentNoticeText}>
                {paymentMethod === "Cash on Delivery"
                  ? "You will pay the total amount when your order arrives."
                  : `You selected ${paymentMethod}. Payment is currently pending. Follow the store's payment instructions to complete your payment.`}
              </Text>
            </View>
          </View>

          {/* ORDER NOTICE */}
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Please check your name, contact number, address, and order
              details before placing your order.
            </Text>
          </View>

          {/* PLACE ORDER */}
          <Pressable
            style={[
              styles.placeOrderButton,
              placingOrder && styles.disabledButton,
            ]}
            onPress={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.placeOrderText}>
                PLACE ORDER - {money(total)}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={placingOrder}
          >
            <Text style={styles.cancelButtonText}>BACK TO CART</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f5",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  backText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "600",
  },

  logo: {
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 5,
    color: "#111111",
  },

  pageTitle: {
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#111111",
  },

  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 5,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eeeeee",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111111",
    marginBottom: 16,
    backgroundColor: "#ffffff",
  },

  addressInput: {
    minHeight: 95,
  },

  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
    gap: 10,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
  },

  itemDetails: {
    fontSize: 12,
    color: "#777777",
    marginTop: 5,
  },

  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111111",
  },

  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 12,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111111",
  },

  totalAmount: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111111",
  },

  paymentSubtitle: {
    color: "#888888",
    fontSize: 12,
    marginTop: -9,
    marginBottom: 15,
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 11,
    backgroundColor: "#ffffff",
  },

  selectedPaymentOption: {
    borderColor: "#111111",
    backgroundColor: "#fafafa",
  },

  paymentIcon: {
    width: 43,
    height: 43,
    borderRadius: 9,
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    alignItems: "center",
  },

  selectedPaymentIcon: {
    backgroundColor: "#111111",
  },

  paymentInfo: {
    flex: 1,
  },

  paymentTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111111",
  },

  paymentDescription: {
    fontSize: 11,
    color: "#777777",
    marginTop: 4,
  },

  paymentRight: {
    alignItems: "center",
    gap: 7,
  },

  paymentLabel: {
    fontSize: 8,
    color: "#999999",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#bbbbbb",
    justifyContent: "center",
    alignItems: "center",
  },

  radioSelected: {
    borderColor: "#111111",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111111",
  },

  paymentNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f1f1ef",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },

  paymentNoticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: "#555555",
  },

  notice: {
    backgroundColor: "#e9e9e7",
    borderRadius: 9,
    padding: 13,
    marginBottom: 17,
  },

  noticeText: {
    fontSize: 12,
    lineHeight: 19,
    color: "#555555",
  },

  placeOrderButton: {
    backgroundColor: "#111111",
    paddingVertical: 17,
    borderRadius: 9,
    alignItems: "center",
  },

  placeOrderText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  disabledButton: {
    opacity: 0.6,
  },

  cancelButton: {
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 5,
  },

  cancelButtonText: {
    color: "#555555",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: "#f7f7f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111111",
    marginTop: 15,
  },

  emptyText: {
    color: "#777777",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },

  primaryButton: {
    backgroundColor: "#111111",
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 9,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
