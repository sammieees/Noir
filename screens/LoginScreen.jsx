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

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

const handleLogin = async () => {
  setMessage("");

  if (!email.trim() || !password) {
    setMessage("Please enter your email and password.");
    return;
  }

  try {
    const users = JSON.parse(
      (await AsyncStorage.getItem("users")) || "[]"
    );

    const user = users.find(
      (u) => u.email === email.trim().toLowerCase()
    );

    if (!user) {
      setMessage("Email is not registered.");
      return;
    }

    if (user.password !== password) {
      setMessage("Incorrect password.");
      return;
    }

    await AsyncStorage.setItem("user", JSON.stringify(user));
    await AsyncStorage.setItem("loggedIn", "true");

    router.replace("/(tabs)/products");
  } catch (error) {
    console.log(error);
    setMessage("Unable to log in.");
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#777272" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
            WELCOME BACK
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
            Sign in to your NOIR account
          </Text>

          {message ? (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>{message}</Text>
            </View>
          ) : null}

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
            returnKeyType="next"
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
            placeholder="Enter your password"
            placeholderTextColor="#888888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />

          <Pressable
            style={[
              styles.loginButton,
              {
                backgroundColor: "#FFFFFF",
                marginTop: 15,
              },
            ]}
            onPress={handleLogin}
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
              SIGN IN
            </Text>
          </Pressable>

          <View
            style={[
              styles.signupContainer,
              { marginTop: 25 },
            ]}
          >
            <Text style={[styles.accountText, { color: "#AAAAAA" }]}>
              New here?
            </Text>

            <Pressable onPress={() => router.push("/signup")}>
              <Text
                style={[
                  styles.signupText,
                  {
                    color: "#FFFFFF",
                    fontWeight: "bold",
                  },
                ]}
              >
                {" "}Create account
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
