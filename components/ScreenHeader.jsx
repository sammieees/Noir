import { StyleSheet, Text, View } from "react-native";

export default function ScreenHeader({
  title = "Products",
  subtitle = "",
  eyebrow = "Noir / STORE MANAGEMENT",
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>
        {eyebrow}
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  eyebrow: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  title: {
    color: "#0F172A",
    fontSize: 29,
    fontWeight: "900",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 5,
  },
});