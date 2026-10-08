import { useRouter } from "expo-router";
import {
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { completeSale, money } from "../../lib/store";
import { useCart } from "../CartContext";

export default function Cart() {
  const router = useRouter();

  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    total,
  } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert(
        "Cart is Empty",
        "Please add a product first."
      );
      return;
    }

    Alert.alert(
      "Order Confirmation",
      `Your total is ${money(total)}. Place order?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Place Order",
          onPress: async () => {
            try {
              // SAVE SALE + REDUCE INVENTORY
              await completeSale(cart);

              // CLEAR CART ONLY AFTER SUCCESSFUL SAVE
              clearCart();

              Alert.alert(
                "Order Successful",
                "Thank you for your order! Your purchase has been recorded."
              );
            } catch (error) {
              console.log(
                "CHECKOUT ERROR:",
                error
              );

              Alert.alert(
                "Checkout Error",
                "The order could not be completed. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.cartCard}>
        <Image
          source={item.image}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={styles.productName}>
            {item.name}
          </Text>

          <Text style={styles.size}>
            Size: {item.size}
          </Text>

          <Text style={styles.price}>
            {money(item.price)}
          </Text>

          <View style={styles.bottomRow}>
            {/* QUANTITY */}
            <View style={styles.quantityContainer}>
              <Pressable
                style={styles.quantityButton}
                onPress={() =>
                  decreaseQuantity(item.cartId)
                }
              >
                <Text style={styles.quantityText}>
                  −
                </Text>
              </Pressable>

              <Text style={styles.quantity}>
                {item.quantity}
              </Text>

              <Pressable
                style={styles.quantityButton}
                onPress={() =>
                  increaseQuantity(item.cartId)
                }
              >
                <Text style={styles.quantityText}>
                  +
                </Text>
              </Pressable>
            </View>

            {/* REMOVE */}
            <Pressable
              onPress={() =>
                removeFromCart(item.cartId)
              }
            >
              <Text style={styles.removeText}>
                Remove
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>
          My Cart
        </Text>

        {cart.length > 0 && (
          <Pressable
            onPress={() =>
              Alert.alert(
                "Clear Cart",
                "Remove all products from your cart?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Clear",
                    onPress: clearCart,
                    style: "destructive",
                  },
                ]
              )
            }
          >
            <Text style={styles.clearText}>
              Clear
            </Text>
          </Pressable>
        )}
      </View>

      {/* EMPTY CART */}
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            🛒
          </Text>

          <Text style={styles.emptyTitle}>
            Your cart is empty
          </Text>

          <Text style={styles.emptyText}>
            Add some men's wear products to your
            cart.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() =>
              router.push("/(tabs)/products")
            }
          >
            <Text style={styles.shopButtonText}>
              Shop Now
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) =>
              item.cartId
            }
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* CHECKOUT */}
          <View style={styles.checkoutContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Total
              </Text>

              <Text style={styles.total}>
                {money(total)}
              </Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>
                Buy Now
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },

  header: {
    height: 65,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 25,
    fontWeight: "900",
    color: "#222",
  },

  clearText: {
    color: "#d33",
    fontWeight: "700",
    fontSize: 15,
  },

  list: {
    padding: 15,
    paddingBottom: 130,
  },

  cartCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
  },

  productImage: {
    width: 105,
    height: 125,
    borderRadius: 13,
  },

  productInfo: {
    flex: 1,
    paddingLeft: 14,
  },

  productName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#222",
  },

  size: {
    marginTop: 5,
    color: "#777",
    fontSize: 14,
  },

  price: {
    marginTop: 7,
    fontSize: 17,
    fontWeight: "900",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#eef2f7",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityText: {
    fontSize: 20,
    fontWeight: "800",
  },

  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "800",
  },

  removeText: {
    color: "#d33",
    fontSize: 13,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
  },

  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  shopButton: {
    backgroundColor: "#222",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },

  shopButtonText: {
    color: "#fff",
    fontWeight: "800",
  },

  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  totalLabel: {
    fontSize: 17,
    fontWeight: "700",
  },

  total: {
    fontSize: 22,
    fontWeight: "900",
  },

  checkoutButton: {
    backgroundColor: "#222",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  checkoutText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },
});