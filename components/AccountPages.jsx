
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Page({ title, children }) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || "default"}
        multiline={multiline}
      />
    </View>
  );
}

function SaveButton({ label = "Save Changes", onPress }) {
  return (
    <Pressable style={styles.saveButton} onPress={onPress}>
      <Text style={styles.saveText}>{label}</Text>
    </Pressable>
  );
}

// EDIT PROFILE
export function EditProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (raw) {
          const user = JSON.parse(raw);
          setName(user.name || user.fullName || "");
          setEmail(user.email || "");
          setPhone(user.phone || "");
        }
      } catch (error) {
        console.log("LOAD PROFILE ERROR:", error);
      }
    };
    load();
  }, []);

  const save = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Missing Information", "Please enter your name and email.");
      return;
    }

    try {
      const raw = await AsyncStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : {};

      const updatedUser = {
        ...user,
        name: name.trim(),
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      const rawUsers = await AsyncStorage.getItem("users");
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const updatedUsers = users.map((item) =>
        item.email === user.email ? { ...item, ...updatedUser } : item
      );
      await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));

      Alert.alert("Success", "Your profile has been updated.");
    } catch (error) {
      console.log("SAVE PROFILE ERROR:", error);
      Alert.alert("Error", "Unable to save your profile.");
    }
  };

  return (
    <Page title="Edit Profile">
      <Text style={styles.description}>Update your personal information.</Text>
      <Field label="Full Name" value={name} onChangeText={setName} />
      <Field label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <SaveButton onPress={save} />
    </Page>
  );
}

// MY ADDRESSES
export function MyAddressesPage() {
  const [address, setAddress] = useState("");
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const raw = await AsyncStorage.getItem("Noir addresses");
      setAddresses(raw ? JSON.parse(raw) : []);
    } catch (error) {
      console.log("LOAD ADDRESSES ERROR:", error);
    }
  };

  const saveAddresses = async (items) => {
    setAddresses(items);
    await AsyncStorage.setItem("Noir addresses", JSON.stringify(items));
  };

  const addAddress = async () => {
    if (!address.trim()) {
      Alert.alert("Missing Address", "Please enter your address.");
      return;
    }

    try {
      const newAddress = {
        id: String(Date.now()),
        address: address.trim(),
      };
      await saveAddresses([...addresses, newAddress]);
      setAddress("");
      Alert.alert("Success", "Address added.");
    } catch (error) {
      Alert.alert("Error", "Unable to save address.");
    }
  };

  const deleteAddress = (id) => {
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => saveAddresses(addresses.filter((item) => item.id !== id)),
      },
    ]);
  };

  return (
    <Page title="My Addresses">
      <Text style={styles.description}>Add and manage your delivery addresses.</Text>
      <Field
        label="Delivery Address"
        value={address}
        onChangeText={setAddress}
        placeholder="House number, street, barangay, city"
        multiline
      />
      <SaveButton label="Add Address" onPress={addAddress} />

      <Text style={styles.sectionTitle}>Saved Addresses</Text>
      {addresses.length === 0 ? (
        <Text style={styles.empty}>No saved addresses yet.</Text>
      ) : (
        addresses.map((item) => (
          <View key={item.id} style={styles.addressCard}>
            <Text style={styles.addressText}>{item.address}</Text>
            <Pressable onPress={() => deleteAddress(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ))
      )}
    </Page>
  );
}

// CHANGE PASSWORD
export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing Information", "Please complete all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Invalid Password", "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "New passwords do not match.");
      return;
    }

    try {
      const raw = await AsyncStorage.getItem("user");
      if (!raw) {
        Alert.alert("Error", "User account not found. Please log in again.");
        return;
      }

      const user = JSON.parse(raw);

      if (user.password !== currentPassword) {
        Alert.alert("Incorrect Password", "Your current password is incorrect.");
        return;
      }

      const updatedUser = { ...user, password: newPassword };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      const rawUsers = await AsyncStorage.getItem("users");
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      const updatedUsers = users.map((item) =>
        item.email === user.email
          ? { ...item, password: newPassword }
          : item
      );
      await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Your password has been changed.");
    } catch (error) {
      console.log("CHANGE PASSWORD ERROR:", error);
      Alert.alert("Error", "Unable to change your password.");
    }
  };

  return (
    <Page title="Change Password">
      <Text style={styles.description}>Create a new password for your account.</Text>
      <Field label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
      <Field label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
      <Field label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <SaveButton label="Update Password" onPress={changePassword} />
    </Page>
  );
}

// HELP AND SUPPORT
export function HelpSupportPage() {
  return (
    <Page title="Help and Support">
      <Text style={styles.description}>
        Need help with your NOIR account or order? Check the information below.
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Orders and Delivery</Text>
        <Text style={styles.infoText}>
          Open My Orders to check the status of your purchases.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Account Assistance</Text>
        <Text style={styles.infoText}>
          You can update your profile and password from the Account section.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Contact</Text>
        <Text style={styles.infoText}>
          Please contact the NOIR store administrator for assistance.
        </Text>
      </View>
    </Page>
  );
}

// ABOUT NOIR
export function AboutNoirPage() {
  return (
    <Page title="About NOIR">
      <View style={styles.aboutCard}>
        <Text style={styles.brand}>NOIR</Text>
        <Text style={styles.tagline}>LOOK GOOD. FEEL GOOD.</Text>
      </View>

      <Text style={styles.sectionTitle}>About Us</Text>
      <Text style={styles.bodyText}>
        NOIR is a clothing shopping app where customers can explore products,
        save their favorites, add items to their cart, and manage their orders.
      </Text>

      <Text style={styles.sectionTitle}>Our Purpose</Text>
      <Text style={styles.bodyText}>
        Our goal is to provide a simple and convenient shopping experience.
      </Text>

      <Text style={styles.footer}>NOIR · LOOK GOOD. FEEL GOOD.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  back: {
    marginBottom: 8,
  },
  backText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "700",
  },
  title: {
    color: "#111",
    fontSize: 24,
    fontWeight: "900",
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  description: {
    color: "#777",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: "#333",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 13,
    color: "#111",
    fontSize: 14,
  },
  multiline: {
    minHeight: 95,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  saveText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
  },
  sectionTitle: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 25,
    marginBottom: 12,
  },
  empty: {
    color: "#888",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 10,
    textAlign: "center",
  },
  addressCard: {
    backgroundColor: "#fff",
    borderRadius: 11,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addressText: {
    flex: 1,
    color: "#333",
    fontSize: 13,
    lineHeight: 19,
  },
  deleteText: {
    color: "#c22",
    fontSize: 12,
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoTitle: {
    color: "#111",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 7,
  },
  infoText: {
    color: "#777",
    fontSize: 13,
    lineHeight: 20,
  },
  aboutCard: {
    backgroundColor: "#111",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginBottom: 10,
  },
  brand: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 6,
  },
  tagline: {
    color: "#ddd",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 8,
  },
  bodyText: {
    color: "#666",
    fontSize: 14,
    lineHeight: 23,
  },
  footer: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 35,
  },
});
