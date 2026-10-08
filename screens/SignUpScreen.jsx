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

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    setMessage("");

    // Check empty fields
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirm
    ) {
      setMessage("Please complete all fields.");
      return;
    }

    // Check email
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      setMessage(
        "Please enter a valid email address."
      );
      return;
    }

    // Check password length
    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    // Check password confirmation
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const oldUser =
        await AsyncStorage.getItem("user");

      if (oldUser) {
        setMessage(
          "An account already exists on this device. Please log in."
        );
        return;
      }

      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };

      await AsyncStorage.setItem(
        "user",
        JSON.stringify(newUser)
      );

      setMessage(
        "Account created! Redirecting to login..."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 900);
    } catch (error) {
      console.log("SIGN UP ERROR:", error);

      setMessage(
        "Could not create your account. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          Register
        </Text>

        <Text style={styles.subtitle}>
          Create your account
        </Text>

        {message ? (
          <View style={styles.alertBox}>
            <Text style={styles.alertText}>
              {message}
            </Text>
          </View>
        ) : null}

        <Text style={styles.label}>
          FULL NAME
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Your full name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

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
          placeholder="At least 6 characters"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>
          CONFIRM PASSWORD
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          placeholderTextColor="#999"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <Pressable
          style={styles.loginButton}
          onPress={submit}
        >
          <Text style={styles.buttonText}>
            CREATE ACCOUNT
          </Text>
        </Pressable>

        <View style={styles.loginContainer}>
          <Text style={styles.accountText}>
            Already registered?
          </Text>

          <Pressable
            onPress={() =>
              router.replace("/login")
            }
          >
            <Text style={styles.loginText}>
              {" "}Login
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}