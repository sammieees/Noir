import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>P</Text>

        <Text style={styles.title}>Simple POS</Text>

        <Text style={styles.description}>
          Manage your products, sales, and inventory in one simple place.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>

        <Text style={styles.footer}>Point of Sale System</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 25,
    padding: 35,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#111111",
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 70,
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111111",
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },

  button: {
    width: "100%",
    backgroundColor: "#111111",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  footer: {
    marginTop: 25,
    fontSize: 13,
    color: "#999999",
  },
});