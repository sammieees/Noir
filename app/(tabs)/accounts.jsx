
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

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

export default function AccountScreen() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const savedUser = await AsyncStorage.getItem("user");
      const currentUser = savedUser ? JSON.parse(savedUser) : null;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      setUser(currentUser);
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setContactNumber(
        currentUser.contactNumber || currentUser.phone || ""
      );
      setDeliveryAddress(currentUser.deliveryAddress || "");
    } catch (error) {
      console.log("LOAD PROFILE ERROR:", error);
      Alert.alert("Error", "Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const saveProfile = async () => {
    if (!name.trim() || !contactNumber.trim()) {
      Alert.alert("Required", "Please complete all required fields.");
      return;
    }

    if (!isAdmin && !deliveryAddress.trim()) {
      Alert.alert("Required", "Please enter your delivery address.");
      return;
    }

    try {
      setSaving(true);

      const updatedUser = {
        ...user,
        name: name.trim(),
        contactNumber: contactNumber.trim(),
      };

      // Only customers need a delivery address
      if (!isAdmin) {
        updatedUser.deliveryAddress = deliveryAddress.trim();
      }

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      // Update registered customer information
      if (!isAdmin) {
        const savedUsers = await AsyncStorage.getItem("users");
        const users = savedUsers ? JSON.parse(savedUsers) : [];

        const updatedUsers = users.map((registeredUser) => {
          if (
            registeredUser.email?.toLowerCase() ===
            user.email?.toLowerCase()
          ) {
            return {
              ...registeredUser,
              name: name.trim(),
              contactNumber: contactNumber.trim(),
              deliveryAddress: deliveryAddress.trim(),
            };
          }

          return registeredUser;
        });

        await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));
      }

      setUser(updatedUser);
      Alert.alert("Success", "Your profile has been updated.");
    } catch (error) {
      console.log("SAVE PROFILE ERROR:", error);
      Alert.alert("Error", "Unable to save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Required", "Please complete all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Invalid Password", "Use at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password Error", "New passwords do not match.");
      return;
    }

    try {
      // Admin password is stored separately
      if (isAdmin) {
        const savedAdminPassword = await AsyncStorage.getItem("adminPassword");
        const correctPassword = savedAdminPassword || "admin123";

        if (currentPassword !== correctPassword) {
          Alert.alert("Incorrect Password", "Your current password is incorrect.");
          return;
        }

        await AsyncStorage.setItem("adminPassword", newPassword);

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        Alert.alert("Success", "Admin password has been changed.");
        return;
      }

      const savedUsers = await AsyncStorage.getItem("users");
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      const userIndex = users.findIndex(
        (item) =>
          item.email?.toLowerCase() === user.email?.toLowerCase()
      );

      if (userIndex === -1) {
        Alert.alert("Error", "Registered account was not found.");
        return;
      }

      if (users[userIndex].password !== currentPassword) {
        Alert.alert("Incorrect Password", "Your current password is incorrect.");
        return;
      }

      users[userIndex].password = newPassword;

      await AsyncStorage.setItem("users", JSON.stringify(users));

      const updatedUser = {
        ...user,
        password: newPassword,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Alert.alert("Success", "Your password has been changed.");
    } catch (error) {
      console.log("CHANGE PASSWORD ERROR:", error);
      Alert.alert("Error", "Unable to change your password.");
    }
  };

  const logout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(["user", "loggedIn"]);
          router.replace("/login");
        },
      },
    ]);
  };

  const passwordInput = (
    label,
    value,
    setValue,
    visible,
    setVisible,
    placeholder
  ) => (
    <View>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.passwordBox}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          secureTextEntry={!visible}
        />

        <Pressable
          onPress={() => setVisible(!visible)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#111111"
          />
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111111" />
        <Text style={styles.loadingText}>Loading your account...</Text>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>MY ACCOUNT</Text>
            <Text style={styles.subtitle}>Manage your NOIR profile</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={42} color="#111111" />
            </View>

            <Text style={styles.profileName}>
              {name || "NOIR User"}
            </Text>

            <Text style={styles.profileEmail}>{email}</Text>

            <Text style={styles.roleText}>
              {user.role?.toUpperCase() || "CUSTOMER"}
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={21} color="#111111" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#999999"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              placeholder="Email address"
              placeholderTextColor="#999999"
            />

            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              value={contactNumber}
              onChangeText={setContactNumber}
              placeholder="Enter your contact number"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
            />

            {!isAdmin && (
              <>
                <Text style={styles.label}>Delivery Address</Text>
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  placeholder="Enter your delivery address"
                  placeholderTextColor="#999999"
                  multiline
                  textAlignVertical="top"
                />
              </>
            )}

            <Pressable
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={saveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.buttonText}>SAVE CHANGES</Text>
                </>
              )}
            </Pressable>
          </View>


          <Pressable style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#111111" />
            <Text style={styles.logoutButtonText}>LOGOUT</Text>
          </Pressable>

          <Text style={styles.footerText}>NOIR MEN'S WEAR</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef2f7",
  },
  loadingText: {
    marginTop: 12,
    color: "#666666",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: "#111111",
    margin: 15,
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  profileEmail: {
    fontSize: 13,
    color: "#CCCCCC",
    marginTop: 5,
  },
  roleText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 12,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 18,
    borderRadius: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111111",
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    color: "#333333",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111111",
  },
  disabledInput: {
    color: "#888888",
    backgroundColor: "#eeeeee",
  },
  addressInput: {
    minHeight: 90,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRadius: 9,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111111",
  },
  eyeButton: {
    padding: 12,
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#111111",
    paddingVertical: 16,
    borderRadius: 9,
    marginTop: 22,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#111111",
    paddingVertical: 15,
    borderRadius: 9,
  },
  logoutButtonText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  footerText: {
    textAlign: "center",
    color: "#999999",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
    marginTop: 25,
  },
});
