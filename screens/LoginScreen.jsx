import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
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

    // Check empty fields
    if (!email.trim() || !password) {
      setMessage(
        "Please enter your email and password."
      );
      return;
    }

    try {
      // Get registered account
      const raw =
        await AsyncStorage.getItem("user");

      if (!raw) {
        setMessage(
          "No account found. Please create an account first."
        );
        return;
      }

      const user = JSON.parse(raw);

      // Check email
      if (
        email.trim().toLowerCase() !==
        user.email.toLowerCase()
      ) {
        setMessage(
          "Email is not registered."
        );
        return;
      }

      // Check password
      if (password !== user.password) {
        setMessage("Incorrect password.");
        return;
      }

      // Save login status
      await AsyncStorage.setItem(
        "loggedIn",
        "true"
      );

      // Go to Products
      router.replace(
        "/(tabs)/products"
      );
    } catch (error) {
      console.log("LOGIN ERROR:", error);

      setMessage(
        "Unable to log in. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        <Text style={styles.title}>
          WELCOME BACK
        </Text>

        <Text style={styles.subtitle}>
          Sign in to your NOIR account
        </Text>

        {message ? (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              {message}
            </Text>
          </View>
        ) : null}

        <Text style={styles.label}>
          EMAIL ADDRESS
        </Text>

        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>
          PASSWORD
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            SIGN IN
          </Text>
        </Pressable>

        <View style={styles.signupContainer}>
          <Text style={styles.accountText}>
            New here?
          </Text>

          <Pressable
            onPress={() =>
              router.push("/signup")
            }
          >
            <Text style={styles.signupText}>
              {" "}Create account
            </Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
}