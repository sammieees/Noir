import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
} from "react-native";

export function AppButton({
  title,
  onPress,
  loading = false,
  variant = "primary",
  compact = false,
}) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";

  const backgroundColor = isDanger
    ? "#DC2626"
    : isPrimary
    ? "#0F172A"
    : "#CCFBF1";

  const textColor =
    isPrimary || isDanger
      ? "#FFFFFF"
      : "#0F172A";

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,

        compact && styles.compact,

        {
          backgroundColor: backgroundColor,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={textColor}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
            },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Main button
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  // Smaller button
  compact: {
    minHeight: 38,
    paddingHorizontal: 12,
  },

  // Button text
  text: {
    fontSize: 14,
    fontWeight: "800",
  },
});