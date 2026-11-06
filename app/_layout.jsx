import { Stack } from "expo-router";
import { CartProvider } from "./CartContext";

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="checkout" />
      </Stack>
    </CartProvider>
  );
}