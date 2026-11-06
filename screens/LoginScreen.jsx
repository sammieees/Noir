
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ADMIN_EMAIL = "admin@noir.com";
  const ADMIN_PASSWORD = "admin123";

  // AUTOMATIC ADMIN OR CUSTOMER LOGIN
  const handleLogin = async () => {
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();

      // CHECK ADMIN ACCOUNT
      if (cleanEmail === ADMIN_EMAIL) {
        const savedAdminPassword = await AsyncStorage.getItem(
          "adminPassword"
        );

        const correctAdminPassword =
          savedAdminPassword || ADMIN_PASSWORD;

        if (password === correctAdminPassword) {
          const admin = {
            name: "NOIR Admin",
            email: ADMIN_EMAIL,
            role: "Admin",
          };

          await AsyncStorage.setItem("user", JSON.stringify(admin));
          await AsyncStorage.setItem("loggedIn", "true");

          router.replace("/(tabs)/dashboard");
          return;
        }

        setMessage("Admin password is incorrect.");
        return;
      }

      // CHECK CUSTOMER ACCOUNT
      const savedUsers = await AsyncStorage.getItem("users");
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      const customer = users.find(
        (user) =>
          user.email?.trim().toLowerCase() === cleanEmail &&
          user.password === password
      );

      if (!customer) {
        setMessage("Email or password is incorrect.");
        return;
      }

      const loggedInCustomer = {
        ...customer,
        role: "Customer",
      };

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(loggedInCustomer)
      );

      await AsyncStorage.setItem("loggedIn", "true");

      router.replace("/(tabs)/products");
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      setMessage("Unable to log in.");
    }
  };

  // RESET PASSWORD FOR ADMIN AND CUSTOMER
  const resetPassword = async () => {
    setMessage("");

    if (!email.trim() || !newPassword || !confirmPassword) {
      setMessage("Please complete all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();

      // ADMIN PASSWORD RESET
      if (cleanEmail === ADMIN_EMAIL) {
        await AsyncStorage.setItem("adminPassword", newPassword);

        setForgotPassword(false);
        setNewPassword("");
        setConfirmPassword("");
        setPassword("");

        setMessage("Admin password updated. You can now log in.");
        return;
      }

      // CUSTOMER PASSWORD RESET
      const savedUsers = await AsyncStorage.getItem("users");
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      const userIndex = users.findIndex(
        (user) =>
          user.email?.trim().toLowerCase() === cleanEmail
      );

      if (userIndex === -1) {
        setMessage("Email is not registered.");
        return;
      }

      users[userIndex].password = newPassword;

      await AsyncStorage.setItem("users", JSON.stringify(users));

      setForgotPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setPassword("");

      setMessage("Password updated. You can now log in.");
    } catch (error) {
      console.log("RESET PASSWORD ERROR:", error);
      setMessage("Unable to reset password.");
    }
  };

  const inputStyle = {
    backgroundColor: "#222222",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#555555",
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#eeeeee" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: "#111111",
            padding: 25,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "#333333",
          }}
        >
          <Image
            source={require("../assets/products/logo.png")}
            style={{ width: "100%", height: 110, marginBottom: 15 }}
            resizeMode="contain"
          />

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 25,
              fontWeight: "bold",
              textAlign: "center",
              letterSpacing: 3,
            }}
          >
            {forgotPassword ? "RESET PASSWORD" : "WELCOME BACK"}
          </Text>

          <Text
            style={{
              color: "#AAAAAA",
              textAlign: "center",
              marginTop: 8,
              marginBottom: 25,
            }}
          >
            {forgotPassword
              ? "Create a new password for your account"
              : "Sign in to your NOIR account"}
          </Text>

          {message ? (
            <Text
              style={{
                color: message.includes("updated")
                  ? "#8BE28B"
                  : "#FF7777",
                textAlign: "center",
                marginBottom: 15,
              }}
            >
              {message}
            </Text>
          ) : null}

          <Text style={{ color: "#FFFFFF", marginBottom: 8 }}>
            EMAIL ADDRESS
          </Text>

          <TextInput
            style={{ ...inputStyle, marginBottom: 18 }}
            placeholder="you@example.com"
            placeholderTextColor="#888888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {forgotPassword ? (
            <>
              <Text style={{ color: "#FFFFFF", marginBottom: 8 }}>
                NEW PASSWORD
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#222222",
                  borderWidth: 1,
                  borderColor: "#555555",
                  borderRadius: 8,
                  marginBottom: 18,
                }}
              >
                <TextInput
                  style={{ flex: 1, color: "#FFFFFF", padding: 14 }}
                  placeholder="Enter new password"
                  placeholderTextColor="#888888"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />

                <Pressable
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={{ padding: 12 }}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              <Text style={{ color: "#FFFFFF", marginBottom: 8 }}>
                CONFIRM NEW PASSWORD
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#222222",
                  borderWidth: 1,
                  borderColor: "#555555",
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                <TextInput
                  style={{ flex: 1, color: "#FFFFFF", padding: 14 }}
                  placeholder="Confirm new password"
                  placeholderTextColor="#888888"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />

                <Pressable
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={{ padding: 12 }}
                >
                  <Ionicons
                    name={
                      showConfirmPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={22}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={resetPassword}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: 16,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#000000", fontWeight: "bold" }}>
                  UPDATE PASSWORD
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setForgotPassword(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setMessage("");
                }}
                style={{ alignItems: "center", marginTop: 20 }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                  BACK TO LOGIN
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ color: "#FFFFFF", marginBottom: 8 }}>
                PASSWORD
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#222222",
                  borderWidth: 1,
                  borderColor: "#555555",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <TextInput
                  style={{ flex: 1, color: "#FFFFFF", padding: 14 }}
                  placeholder="Enter your password"
                  placeholderTextColor="#888888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />

                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 12 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={() => {
                  setForgotPassword(true);
                  setMessage("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                style={{
                  alignSelf: "flex-end",
                  marginBottom: 20,
                  marginTop: 8,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
                  Forgot Password?
                </Text>
              </Pressable>

              <Pressable
                onPress={handleLogin}
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: 16,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#000000",
                    fontWeight: "bold",
                    letterSpacing: 2,
                  }}
                >
                  SIGN IN
                </Text>
              </Pressable>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 25,
                }}
              >
                <Text style={{ color: "#AAAAAA" }}>New here?</Text>

                <Pressable onPress={() => router.push("/signup")}>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      marginLeft: 5,
                    }}
                  >
                    Create account
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          <Text
            style={{
              color: "#666666",
              textAlign: "center",
              fontSize: 10,
              letterSpacing: 3,
              marginTop: 30,
            }}
          >
            THE MODERN GENTLEMAN
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
