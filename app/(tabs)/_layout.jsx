
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";
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

      const user = JSON.parse(savedUser);
      const currentRole = user.role?.toLowerCase();

      if (
        currentRole !== "admin" &&
        currentRole !== "customer"
      ) {
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <ActivityIndicator size="large" color="#111111" />
      </View>
    );
  }

  const isAdmin = role === "admin";

  const tabStyle = {
    headerShown: false,
    tabBarActiveTintColor: "#111111",
    tabBarInactiveTintColor: "#999999",
    tabBarShowLabel: true,

    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: "600",
      marginBottom: 3,
      letterSpacing: 0.4,
    },

    tabBarStyle: {
      height: 62 + insets.bottom,
      paddingTop: 6,
      paddingBottom: Math.max(insets.bottom, 8),
      backgroundColor: "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: "#EEEEEE",
      elevation: 8,
    },
  };

  function renderIcon(iconName, focused, color) {
    return (
      <Ionicons
        name={iconName}
        size={23}
        color={color || (focused ? "#111111" : "#999999")} />
    );
  }

  return (
    <Tabs screenOptions={tabStyle}>

      {/* ADMIN TABS */}

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            renderIcon(focused ? "grid" : "grid-outline", focused, color),
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: "Products",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            renderIcon(focused ? "cube" : "cube-outline", focused, color),
        }}
      />

      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            renderIcon(focused ? "bar-chart" : "bar-chart-outline", focused, color),
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            renderIcon(focused ? "people" : "people-outline", focused, color),
        }}
      />

      {/* CUSTOMER TABS */}

      <Tabs.Screen
        name="products"
        options={{
          title: "Shop",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            renderIcon(focused ? "shirt" : "shirt-outline", focused, color),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            renderIcon(focused ? "heart" : "heart-outline", focused, color),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "My Cart",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            renderIcon(focused ? "bag-handle" : "bag-handle-outline", focused, color),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "My Orders",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused, color }) =>
            renderIcon(focused ? "receipt" : "receipt-outline", focused, color),
        }}
      />

      {/* ACCOUNT TAB */}

      <Tabs.Screen
        name="accounts"
        options={{
          title: "Account",
          href: undefined,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={25} color={color || "#999999"} />
          ),
        }}
      />

      {/* HIDDEN SCREENS */}

      <Tabs.Screen
        name="admin-orders"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="customer-details"
        options={{ href: null }}
      />

    </Tabs>
  );
}
