import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

export function AppButton({ title, onPress, loading = false }) {
  return (
    <Pressable style={styles.button} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0F172A",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});