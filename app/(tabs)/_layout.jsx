import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#999",

        tabBarStyle: {
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",

          tabBarIcon: ({ focused }) => (
            <Text
              style={{
                fontSize: focused ? 23 : 20,
                opacity: focused ? 1 : 0.6,
              }}
            >
              🛍️
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",

          tabBarIcon: ({ focused }) => (
            <Text
              style={{
                fontSize: focused ? 23 : 20,
                opacity: focused ? 1 : 0.6,
              }}
            >
              🛒
            </Text>
          ),
        }}
      />

        <Tabs.Screen
    name="sales"
    options={{
      title: "Sales",

      tabBarIcon: ({ focused }) => (
        <Text
          style={{
            fontSize: focused ? 23 : 20,
            fontWeight: "800",
            opacity: focused ? 1 : 0.6,
          }}
        >
          ₱
        </Text>
      ),
    }}
  />

      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",

          tabBarIcon: ({ focused }) => (
            <Text
              style={{
                fontSize: focused ? 23 : 20,
                opacity: focused ? 1 : 0.6,
              }}
            >
              📦
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}