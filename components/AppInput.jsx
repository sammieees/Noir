import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}) {
  return (
    <View style={styles.container}>
      {label ? (
        <Text style={styles.label}>
          {label}
        </Text>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },

  label: {
    color: "#252525",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    color: "#0F172A",
    fontSize: 14,
  },
});