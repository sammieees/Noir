
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { money } from "../../lib/store";
import { useCart } from "../CartContext";

export default function CartScreen() {
  const router = useRouter();

  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const safeCart = Array.isArray(cart) ? cart : [];

  const subtotal = safeCart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const totalItems = safeCart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const getProductImage = (item) => {
    const image =
      item.image ??
      item.imageUrl ??
      item.photo ??
      item.thumbnail;

    if (!image) return null;
    if (typeof image === "number") return image;

    if (typeof image === "object" && image.uri) {
      return { uri: image.uri };
    }

    if (
      typeof image === "string" &&
      (image.startsWith("http://") ||
        image.startsWith("https://"))
    ) {
      return { uri: image };
    }

    return null;
  };

  const renderCartItem = ({ item }) => {
    const imageSource = getProductImage(item);

    return (
      <View style={styles.cartCard}>
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="shirt-outline"
                size={34}
                color="#999"
              />
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <View style={styles.productTop}>
            <View style={styles.productDetails}>
              <Text style={styles.category}>
                {item.category ?? "MEN'S COLLECTION"}
              </Text>

              <Text style={styles.productName} numberOfLines={2}>
                {item.name ?? item.title ?? "Product"}
              </Text>

              {item.size ? (
                <View style={styles.sizeTag}>
                  <Text style={styles.sizeText}>
                    SIZE: {item.size}
                  </Text>
                </View>
              ) : null}
            </View>

            <Pressable
              style={styles.deleteButton}
              onPress={() => removeFromCart(item.cartId)}
              hitSlop={8}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color="#777"
              />
            </Pressable>
          </View>

          <View style={styles.productBottom}>
            <View>
              <Text style={styles.priceLabel}>PRICE</Text>
              <Text style={styles.productPrice}>
                {money(item.price ?? 0)}
              </Text>
            </View>

            <View style={styles.quantityContainer}>
              <Pressable
                style={styles.quantityButton}
                onPress={() => decreaseQuantity(item.cartId)}
              >
                <Ionicons name="remove" size={16} color="#111" />
              </Pressable>

              <Text style={styles.quantityText}>
                {item.quantity}
              </Text>

              <Pressable
                style={styles.quantityButton}
                onPress={() => increaseQuantity(item.cartId)}
              >
                <Ionicons name="add" size={16} color="#111" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>NOIR / MEN'S WEAR</Text>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerSubtitle}>
            Review your selected items
          </Text>
        </View>

        <View style={styles.cartCount}>
          <Ionicons name="bag-outline" size={19} color="#fff" />
          <Text style={styles.countText}>{totalItems}</Text>
        </View>
      </View>

      <View style={styles.headerDivider} />

      {safeCart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="bag-handle-outline"
              size={42}
              color="#222"
            />
          </View>

          <Text style={styles.emptyTitle}>YOUR CART IS EMPTY</Text>

          <Text style={styles.emptyDescription}>
            You haven't added any items yet.
            Explore our collection and find your style.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.push("/products")}
          >
            <Text style={styles.shopButtonText}>
              EXPLORE COLLECTION
            </Text>
            <Ionicons
              name="arrow-forward"
              size={17}
              color="#fff"
            />
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={safeCart}
            keyExtractor={(item, index) =>
              String(item.cartId ?? index)
            }
            renderItem={renderCartItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>
                  YOUR ITEMS
                </Text>
                <Text style={styles.itemCount}>
                  {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"}
                </Text>
              </View>
            }
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
              <Ionicons
                name="receipt-outline"
                size={19}
                color="#555"
              />
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {money(subtotal)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping Fee</Text>
              <Text style={styles.shippingValue}>
                Calculated at checkout
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalPrice}>
                {money(subtotal)}
              </Text>
            </View>

            <Pressable
              style={styles.checkoutButton}
              onPress={() => router.push("/checkout")}
            >
              <Text style={styles.checkoutButtonText}>
                PROCEED TO CHECKOUT
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#fff"
              />
            </Pressable>

            <View style={styles.secureCheckout}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#777"
              />
              <Text style={styles.secureText}>
                Safe and secure checkout
              </Text>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F3",
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 15,
    paddingBottom: 19,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brand: {
    fontSize: 9,
    letterSpacing: 3,
    fontWeight: "800",
    color: "#888",
    marginBottom: 8,
  },

  headerTitle: {
    fontSize: 31,
    fontWeight: "800",
    color: "#151515",
    letterSpacing: -1.2,
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  cartCount: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#171717",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  headerDivider: {
    height: 1,
    backgroundColor: "#E5E5E2",
    marginHorizontal: 22,
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#222",
  },

  itemCount: {
    fontSize: 10,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1,
  },

  cartCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 11,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#EAEAE7",
  },

  imageContainer: {
    width: 104,
    height: 119,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ECECE9",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  productInfo: {
    flex: 1,
    marginLeft: 13,
    justifyContent: "space-between",
    paddingVertical: 2,
  },

  productTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  productDetails: {
    flex: 1,
    paddingRight: 5,
  },

  category: {
    fontSize: 8,
    color: "#999",
    letterSpacing: 1.2,
    fontWeight: "700",
    marginBottom: 6,
  },

  productName: {
    fontSize: 14,
    color: "#171717",
    fontWeight: "800",
    lineHeight: 19,
  },

  sizeTag: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F1EF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 8,
  },

  sizeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#555",
    letterSpacing: 0.5,
  },

  deleteButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "#F5F5F3",
  },

  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
  },

  priceLabel: {
    fontSize: 8,
    color: "#999",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 3,
  },

  productPrice: {
    fontSize: 15,
    color: "#171717",
    fontWeight: "800",
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F3",
    borderRadius: 6,
    padding: 2,
  },

  quantityButton: {
    width: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
  },

  quantityText: {
    minWidth: 28,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "#171717",
  },

  summaryContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 21,
    paddingTop: 17,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E5",
  },

  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },

  summaryTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#222",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 12,
    color: "#888",
  },

  summaryValue: {
    fontSize: 12,
    color: "#222",
    fontWeight: "700",
  },

  shippingValue: {
    fontSize: 10,
    color: "#999",
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#EAEAE7",
    marginTop: 3,
    marginBottom: 13,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#222",
  },

  totalPrice: {
    fontSize: 21,
    fontWeight: "900",
    color: "#171717",
  },

  checkoutButton: {
    height: 53,
    backgroundColor: "#171717",
    borderRadius: 7,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  checkoutButtonText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#fff",
  },

  secureCheckout: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },

  secureText: {
    fontSize: 10,
    color: "#999",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EAEAE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 23,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: "#171717",
  },

  emptyDescription: {
    fontSize: 12,
    lineHeight: 20,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
  },

  shopButton: {
    height: 48,
    backgroundColor: "#171717",
    paddingHorizontal: 22,
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  shopButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
