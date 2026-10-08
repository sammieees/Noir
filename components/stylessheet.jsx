import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    padding: 22,
  },

  // Login / Sign Up card
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 4,
  },

  // Title
  title: {
    fontSize: 29,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.4,
  },

  // Subtitle
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },

  // Input label
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#252525",
    marginBottom: 8,
  },

  // Normal input
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },

  // Login / Sign Up button
  loginButton: {
    height: 52,
    backgroundColor: "#0F172A",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },

  // Button text
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Sign Up bottom text
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  // Login bottom text
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  // "New here?" / "Already registered?"
  accountText: {
    color: "#64748B",
    fontSize: 14,
  },

  // "Create account"
  signupText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 5,
    textDecorationLine: "underline",
  },

  // "Sign in"
  loginText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 5,
    textDecorationLine: "underline",
  },

  // Password input container
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },

  // Password text input
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0F172A",
  },

  // Show / Hide password
  showText: {
    color: "#0F172A",
    fontWeight: "800",
    marginRight: 14,
  },

  // Error message box
  alertBox: {
    backgroundColor: "#FEE2E2",
    padding: 11,
    borderRadius: 10,
    marginBottom: 15,
  },

  // Error message text
  alertText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 13,
  },
});

export default styles;