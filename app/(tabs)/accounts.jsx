import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const loadUser = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch (error) {
      console.log("ACCOUNT ERROR:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.multiRemove(["user", "loggedIn"]);
            router.replace("/login");
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.name}>Please log in again.</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const name = user.name || user.fullName || "NOIR User";
  const email = user.email || "No email";
  const isAdmin = String(user.role || "").toLowerCase() === "admin";

  const customerMenu = [
    {
      icon: "receipt-outline",
      label: "My Orders",
      action: () => router.push("/(tabs)/orders"),
    },
    {
      icon: "location-outline",
      label: "My Addresses",
      action: () => router.push("/my-addresses"),
    },
    {
      icon: "lock-closed-outline",
      label: "Change Password",
      action: () => router.push("/change-password"),
    },
    {
      icon: "help-circle-outline",
      label: "Help and Support",
      action: () => router.push("/help-support"),
    },
  ];

  const adminMenu = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      action: () => router.push("/edit-profile"),
    },
    {
      icon: "lock-closed-outline",
      label: "Change Password",
      action: () => router.push("/change-password"),
    },
  ];

  const menu = isAdmin ? adminMenu : customerMenu;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Account</Text>
            <Text style={styles.subtitle}>
              {isAdmin
                ? "Admin Profile"
                : "Manage your account settings"}
            </Text>
          </View>

          <Ionicons name="settings-outline" size={24} color="#111" />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.trim().charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.email}>{email}</Text>

            {isAdmin && (
              <Text style={styles.role}>Administrator</Text>
            )}
          </View>

          {!isAdmin && (
            <Pressable
              style={styles.editButton}
              onPress={() => router.push("/edit-profile")}
            >
              <Text style={styles.editText}>Edit Profile</Text>
            </Pressable>
          )}
        </View>

        {isAdmin && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>Administrator</Text>
            </View>
          </View>
        )}

        <View style={styles.menu}>
          {menu.map((item) => (
            <Pressable
              key={item.label}
              style={styles.menuRow}
              onPress={item.action}
            >
              <Ionicons
                name={item.icon}
                size={21}
                color="#111"
              />
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={19}
                color="#888"
              />
            </Pressable>
          ))}

          {!isAdmin && (
            <Pressable
              style={styles.menuRow}
              onPress={() => router.push("/about-noir")}
            >
              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#111"
              />
              <Text style={styles.menuText}>About NOIR</Text>
              <Ionicons
                name="chevron-forward"
                size={19}
                color="#888"
              />
            </Pressable>
          )}

          <Pressable style={styles.logoutRow} onPress={logout}>
            <Ionicons name="log-out-outline" size={21} color="#d22" />
            <Text style={styles.logoutText}>Logout</Text>
            <Ionicons
              name="chevron-forward"
              size={19}
              color="#d22"
            />
          </Pressable>
        </View>

        <Text style={styles.footer}>NOIR · LOOK GOOD. FEEL GOOD.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f6f6f6" },
  content: { paddingBottom: 35 },
  center: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    backgroundColor: "#fff",
    padding: 19,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "900", color: "#111" },
  subtitle: { fontSize: 12, color: "#888", marginTop: 4 },
  profileCard: {
    backgroundColor: "#fff",
    margin: 14,
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 29, color: "#fff", fontWeight: "900" },
  profileInfo: { flex: 1, marginLeft: 12 },
  profileName: { fontSize: 16, fontWeight: "900", color: "#111" },
  email: { fontSize: 11, color: "#777", marginTop: 4 },
  role: {
    fontSize: 10,
    color: "#111",
    fontWeight: "800",
    marginTop: 5,
  },
  editButton: {
    backgroundColor: "#111",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  editText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 16,
    borderRadius: 13,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#111",
    fontWeight: "900",
    marginBottom: 12,
  },
  infoRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: { color: "#888", fontSize: 12 },
  infoValue: {
    color: "#111",
    fontSize: 12,
    fontWeight: "800",
  },
  menu: {
    marginHorizontal: 14,
    backgroundColor: "#fff",
    borderRadius: 13,
    paddingHorizontal: 15,
  },
  menuRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    flex: 1,
    fontSize: 13,
    color: "#111",
    fontWeight: "700",
  },
  logoutRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutText: {
    flex: 1,
    color: "#d22",
    fontWeight: "800",
    fontSize: 13,
  },
  footer: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 25,
  },
  button: {
    backgroundColor: "#111",
    padding: 13,
    borderRadius: 9,
    marginTop: 15,
  },
  buttonText: { color: "#fff", fontWeight: "900" },
});