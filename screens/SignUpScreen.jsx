
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

import styles from "../components/stylessheet.jsx";

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setMessage("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const savedUsers = await AsyncStorage.getItem("users");
      const users = savedUsers ? JSON.parse(savedUsers) : [];

      const cleanEmail = email.trim().toLowerCase();

      const existingUser = users.find(
        (user) => user.email?.trim().toLowerCase() === cleanEmail
      );

      if (existingUser) {
        setMessage("Email already registered.");
        return;
      }

      const newUser = {
        name: name.trim(),
        email: cleanEmail,
        password: password,
        role: "Customer",
      };

      users.push(newUser);

      await AsyncStorage.setItem("users", JSON.stringify(users));

      const checkUsers = JSON.parse(
        (await AsyncStorage.getItem("users")) || "[]"
      );

      const accountSaved = checkUsers.find(
        (user) => user.email === cleanEmail
      );

      if (!accountSaved) {
        setMessage("Account was not saved. Please try again.");
        return;
      }

      setMessage("Account created successfully!");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      router.replace("/login");

    } catch (error) {
      console.log("SIGNUP ERROR:", error);
      setMessage("Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#777272" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={true}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: "#111010",
              borderColor: "#292929",
              borderWidth: 1,
            },
          ]}
        >
          <Image
            source={require("../assets/products/logo.png")}
            style={{
              width: "100%",
              height: 130,
              alignSelf: "center",
              marginBottom: 15,
            }}
            resizeMode="contain"
          />

          <Text
            style={[
              styles.title,
              {
                color: "#FFFFFF",
                textAlign: "center",
                letterSpacing: 3,
              },
            ]}
          >
            CREATE ACCOUNT
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: "#AAAAAA",
                textAlign: "center",
                marginBottom: 25,
              },
            ]}
          >
            Join NOIR and discover your style
          </Text>

          {message ? (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>{message}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: "#FFFFFF" }]}>
            FULL NAME
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: "#171717",
                color: "#FFFFFF",
                borderColor: "#383838",
                borderWidth: 1,
              },
            ]}
            placeholder="Enter your full name"
            placeholderTextColor="#888888"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: "#FFFFFF" }]}>
            EMAIL ADDRESS
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: "#171717",
                color: "#FFFFFF",
                borderColor: "#383838",
                borderWidth: 1,
              },
            ]}
            placeholder="you@example.com"
            placeholderTextColor="#888888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.label, { color: "#FFFFFF" }]}>
            PASSWORD
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: "#171717",
                color: "#FFFFFF",
                borderColor: "#383838",
                borderWidth: 1,
              },
            ]}
            placeholder="At least 6 characters"
            placeholderTextColor="#888888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: "#FFFFFF" }]}>
            CONFIRM PASSWORD
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: "#171717",
                color: "#FFFFFF",
                borderColor: "#383838",
                borderWidth: 1,
              },
            ]}
            placeholder="Re-enter your password"
            placeholderTextColor="#888888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            onSubmitEditing={handleSignUp}
          />

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              {
                backgroundColor: "#FFFFFF",
                marginTop: 15,
                opacity: loading ? 0.6 : pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: "#000000",
                  fontWeight: "bold",
                  letterSpacing: 2,
                },
              ]}
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </Text>
          </Pressable>

          <View
            style={[
              styles.signupContainer,
              { marginTop: 25 },
            ]}
          >
            <Text style={[styles.accountText, { color: "#AAAAAA" }]}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => router.replace("/login")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.95 : 1 }],
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={[
                  styles.signupText,
                  {
                    color: "#FFFFFF",
                    fontWeight: "bold",
                  },
                ]}
              >
                {" "}Sign in
              </Text>
            </Pressable>
          </View>

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
