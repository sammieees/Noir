import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#111111",
        tabBarInactiveTintColor: "#888888",

        tabBarStyle: {
          height: 72,
          paddingTop: 9,
          paddingBottom: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          elevation: 8,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.8,
          marginTop: 3,
        },

        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: "SHOP",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "shirt" : "shirt-outline"}
              size={focused ? 25 : 23}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "CART",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "bag-handle" : "bag-handle-outline"}
              size={focused ? 25 : 23}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="sales"
        options={{
          title: "SALES",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={focused ? 25 : 23}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: "INVENTORY",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "cube" : "cube-outline"}
              size={focused ? 25 : 23}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
