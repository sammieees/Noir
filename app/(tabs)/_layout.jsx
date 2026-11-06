import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

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
      marginBottom: 7,
      letterSpacing: 0.4,
    },

    tabBarStyle: {
      height: 68,
      paddingTop: 8,
      paddingBottom: 5,
      backgroundColor: "#FFFFFF",
      borderTopWidth: 1,
      borderTopColor: "#EEEEEE",
      elevation: 8,
    },
  };

  const icon = (name, focused) => (
    <Ionicons
      name={focused ? name : `${name}-outline`}
      size={22}
      color={focused ? "#111111" : "#999999"}
    />
  );

  return (
    <Tabs screenOptions={tabStyle}>
      {/* ADMIN TABS */}

      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => icon("grid", focused),
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: "Products",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => icon("cube", focused),
        }}
      />

      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => icon("bar-chart", focused),
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => icon("people", focused),
        }}
      />

      {/* CUSTOMER TABS */}

      <Tabs.Screen
        name="products"
        options={{
          title: "Shop",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => icon("shirt", focused),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => icon("heart", focused),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "My Cart",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => icon("bag-handle", focused),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "My Orders",
          href: !isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => icon("receipt", focused),
        }}
      />

    <Tabs.Screen
  name="accounts"
  options={{
    title: "Account",
    href: undefined,
    tabBarIcon: ({ focused, color }) => (
      <Ionicons
        name={focused ? "person-circle" : "person-circle-outline"}
        size={22}
        color={color}
      />
    ),
  }}
/>
    </Tabs>
  );
}
