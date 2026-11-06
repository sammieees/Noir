
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

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, total, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
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
      `Total: ${money(total)}\nPayment: Cash on Delivery\n\nDo you want to place your order?`,
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

        customerId:
          user.id || user.userId || user.email || null,

        customerEmail: String(user.email || "")
          .trim()
          .toLowerCase(),

        customerName: customerName.trim(),
        contactNumber: contactNumber.trim(),
        deliveryAddress: deliveryAddress.trim(),

        paymentMethod: "Cash on Delivery",

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

      await saveOrders([
        order,
        ...existingOrders,
      ]);

      clearCart();

      Alert.alert(
        "Order Placed Successfully!",
        `Thank you for shopping at NOIR!\n\nOrder ID: ${order.id}\nTotal: ${money(total)}\nPayment: Cash on Delivery`,
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

              <Text style={styles.totalAmount}>
                {money(total)}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            <View style={styles.paymentOption}>
              <View style={styles.radioOuter}>
                <View style={styles.radioInner} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>Cash on Delivery</Text>

                <Text style={styles.paymentDescription}>
                  Pay when your order arrives.
                </Text>
              </View>

              <Text style={styles.codLabel}>COD</Text>
            </View>
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Please check your name, contact number, address, and order
              details before placing your order.
            </Text>
          </View>

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
    backgroundColor: "#eef2f7",
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
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
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
    borderRadius: 9,
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

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111111",
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111111",
  },

  paymentDescription: {
    fontSize: 12,
    color: "#777777",
    marginTop: 4,
  },

  codLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: 1,
  },

  notice: {
    backgroundColor: "#e5e7eb",
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
    borderRadius: 10,
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
    backgroundColor: "#eef2f7",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111111",
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
