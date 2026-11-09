import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const loggedIn = await AsyncStorage.getItem("loggedIn");

      if (!savedUser || loggedIn !== "true") {
        setRole(null);
        router.replace("/login");
        return;
      }

      const currentRole = JSON.parse(savedUser).role?.toLowerCase();

      if (currentRole !== "admin" && currentRole !== "customer") {
        setRole(null);
        router.replace("/login");
        return;
      }

      setRole(currentRole);
    } catch (error) {
      console.log("Error checking user:", error);
      setRole(null);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkUser();
  }, [pathname, checkUser]);

  if (loading || !role) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
      }}>
        <ActivityIndicator size="large" color="#111" />
      </View>
    );
  }

  const isAdmin = role === "admin";

  const tabStyle = {
    headerShown: false,
    tabBarActiveTintColor: "#111",
    tabBarInactiveTintColor: "#999",
    tabBarShowLabel: true,
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: "700",
      marginBottom: 3
    },
    tabBarStyle: {
      height: 62 + insets.bottom,
      paddingTop: 6,
      paddingBottom: Math.max(insets.bottom, 8),
      backgroundColor: "#fff",
      borderTopWidth: 1,
      borderTopColor: "#eee",
      elevation: 8
    }
  };

  const icon = (name, focused, color) => (
    <Ionicons
      name={focused ? name : `${name}-outline`}
      size={22}
      color={color}
    />
  );

  return (
    <Tabs screenOptions={tabStyle}>

      {/* ADMIN NAVIGATION */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            icon("grid", focused, color)
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: "Products",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            icon("cube", focused, color)
        }}
      />

      <Tabs.Screen
        name="admin-orders"
        options={{
          title: "Orders",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            icon("receipt", focused, color)
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            icon("people", focused, color)
        }}
      />

      {/* CUSTOMER NAVIGATION */}
      <Tabs.Screen
        name="products"
        options={{
          title: "Shop",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            icon("shirt", focused, color)
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            icon("heart", focused, color)
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "My Cart",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            icon("bag-handle", focused, color)
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "My Orders",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            icon("receipt", focused, color)
        }}
      />

      {/* SHARED ACCOUNT */}
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Account",
          href: undefined,
          tabBarIcon: ({ focused, color }) =>
            icon("person", focused, color)
        }}
      />

      {/* HIDDEN ROUTES */}
      <Tabs.Screen
        name="sales"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="customer-details"
        options={{ href: null }}
      />
    <Tabs.Screen
  name="admin-order-details/[id]"
  options={{
    href: null,
    headerShown: false,
  }}
  />
    </Tabs>
  );
}