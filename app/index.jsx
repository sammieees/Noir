import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/products/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>WELCOME TO NOIR</Text>

      <Text style={styles.tagline}>
        TIMELESS STYLE. BOLD IDENTITY.
      </Text>

      <Text style={styles.description}>
        Discover your style with our latest collection
        of clothing and essentials.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>
          EXPLORE COLLECTION
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        YOUR STYLE. YOUR STATEMENT.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  logo: {
    width: "100%",
    height: 220,
    marginBottom: 30,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 12,
  },

  tagline: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 25,
  },

  description: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 35,
  },

  button: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 17,
    borderRadius: 6,
    alignItems: "center",
  },

  buttonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },

  footer: {
    color: "#777777",
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 30,
  },
});
