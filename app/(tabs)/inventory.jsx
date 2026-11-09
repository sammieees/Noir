import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  getProducts,
  money,
  saveProducts,
} from "../../lib/store";

export default function InventoryScreen() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [color, setColor] = useState("");
  const [image, setImage] = useState(null);

  const loadProducts = useCallback(async () => {
    const data = await getProducts();
    setProducts(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const resetForm = () => {
    setName("");
    setPrice("");
    setStock("");
    setColor("");
    setImage(null);
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name || "");
    setPrice(String(item.price || ""));
    setStock(String(item.stock || ""));
    setColor(item.color || "");
    setImage(item.image || item.imageUri || null);
    setModal(true);
  };

  const chooseImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow photo access first.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveProduct = async () => {
    if (!name.trim() || !price.trim() || !stock.trim()) {
      Alert.alert("Required", "Complete all required fields.");
      return;
    }

    if (
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      !Number.isFinite(Number(stock)) ||
      Number(stock) < 0
    ) {
      Alert.alert("Invalid", "Check your price and stock.");
      return;
    }

    let updated;

    const data = {
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      color: color.trim() || "—",
      image: image || null,
    };

    if (editing) {
      updated = products.map((p) =>
        p.id === editing.id ? { ...p, ...data } : p
      );
    } else {
      updated = [
        ...products,
        {
          id: `noir-${Date.now()}`,
          category: "Others",
          sizes: ["S", "M", "L", "XL"],
          description: "NOIR fashion collection",
          ...data,
        },
      ];
    }

    await saveProducts(updated);
    setProducts(updated);
    setModal(false);
    resetForm();

    Alert.alert("Success", "Product saved successfully!");
  };

  const deleteProduct = (item) => {
    Alert.alert(
      "Delete Product",
      `Delete ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = products.filter(
              (p) => p.id !== item.id
            );

            await saveProducts(updated);
            setProducts(updated);
          },
        },
      ]
    );
  };

  const filtered = products.filter((p) => {
    const matchesSearch = p.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      p.category?.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    "Shirts",
    "Pants",
    "Jackets",
    "Others",
  ];

  const getImage = (item) => {
    if (item.image === "polo") {
      return require("../../assets/products/polo.jpg");
    }
    if (item.image === "jeans") {
      return require("../../assets/products/jeans.jpg");
    }
    if (item.image === "jacket") {
      return require("../../assets/products/jacket.jpg");
    }
    if (typeof item.image === "string" &&
        (item.image.startsWith("file://") ||
         item.image.startsWith("content://") ||
         item.image.startsWith("http"))) {
      return { uri: item.image };
    }
    if (item.imageUri) {
      return { uri: item.imageUri };
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subtitle}>Manage your inventory</Text>
        </View>

        <Pressable style={styles.addButton} onPress={openAdd}>
          <Text style={styles.addText}>+ Add Product</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.search}
        placeholder="⌕  Search product..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={styles.categories}
  contentContainerStyle={styles.categoryContent}
>
  {categories.map((item) => (
    <Pressable
      key={item}
      onPress={() => setCategory(item)}
      style={[
        styles.categoryButton,
        category === item && styles.activeCategory,
      ]}
    >
      <Text
        style={[
          styles.categoryText,
          category === item && styles.activeText,
        ]}
      >
        {item}
      </Text>
    </Pressable>
  ))}
</ScrollView>

      <ScrollView contentContainerStyle={styles.list}>
        {filtered.map((item) => {
          const productImage = getImage(item);
          const lowStock = Number(item.stock) <= 5;

          return (
            <View style={styles.card} key={item.id}>
              {productImage ? (
                <Image
                  source={productImage}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text>NO IMAGE</Text>
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>
                  {money(item.price)}
                </Text>
                <Text style={styles.stock}>
                  Stock: {item.stock}
                </Text>
                <Text style={styles.color}>
                  Color: {item.color || "—"}
                </Text>
              </View>

              <View style={styles.actions}>
                <Text
                  style={[
                    styles.badge,
                    lowStock ? styles.low : styles.available,
                  ]}
                >
                  {lowStock ? "Low Stock" : "In Stock"}
                </Text>

                <Pressable
                  style={styles.editButton}
                  onPress={() => openEdit(item)}
                >
                  <Text>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteProduct(item)}
                >
                  <Text style={{ color: "#b42318" }}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <Text style={styles.empty}>No products found.</Text>
        )}
      </ScrollView>

      <Modal visible={modal} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>
            {editing ? "Edit Product" : "Add Product"}
          </Text>

          <Pressable style={styles.imageButton} onPress={chooseImage}>
            <Text>Choose Product Image</Text>
          </Pressable>

          {image && (
            <Text style={styles.selectedImage}>Image selected ✓</Text>
          )}

          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />

          <TextInput
            style={styles.input}
            placeholder="Stock Quantity"
            keyboardType="number-pad"
            value={stock}
            onChangeText={setStock}
          />

          <TextInput
            style={styles.input}
            placeholder="Color"
            value={color}
            onChangeText={setColor}
          />

          <Pressable style={styles.saveButton} onPress={saveProduct}>
            <Text style={styles.saveText}>SAVE PRODUCT</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => {
              setModal(false);
              resetForm();
            }}
          >
            <Text>Cancel</Text>
          </Pressable>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    paddingTop: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111",
  },
  subtitle: {
    color: "#777",
    fontSize: 12,
  },
  addButton: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 20,
  },
  addText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
  },
  search: {
    backgroundColor: "#fff",
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 13,
  },
 categories: {
  height: 45,
  flexGrow: 0,
  flexShrink: 0,
  marginTop: 10,
  marginBottom: 10,
},

categoryContent: {
  paddingHorizontal: 15,
  alignItems: "center",
  gap: 8,
},

categoryButton: {
  height: 33,
  paddingHorizontal: 16,
  borderRadius: 20,
  backgroundColor: "#e9e9ec",
  alignItems: "center",
  justifyContent: "center",
},

activeCategory: {
  backgroundColor: "#111",
},

categoryText: {
  fontSize: 11,
  color: "#111",
  fontWeight: "700",
},

activeText: {
  color: "#fff",
},
  list: {
    padding: 15,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  productImage: {
    width: 75,
    height: 95,
  },
  placeholder: {
    width: 75,
    height: 95,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "900",
    fontSize: 13,
    color: "#111",
  },
  price: {
    fontWeight: "900",
    marginTop: 5,
  },
  stock: {
    color: "#38865b",
    fontSize: 11,
    marginTop: 5,
  },
  color: {
    color: "#777",
    fontSize: 11,
  },
  actions: {
    alignItems: "center",
    gap: 7,
  },
  badge: {
    padding: 5,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: "bold",
  },
  available: {
    backgroundColor: "#d8f5df",
    color: "#26733c",
  },
  low: {
    backgroundColor: "#fff0d9",
    color: "#b66b15",
  },
  editButton: {
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#ffe5e5",
    padding: 8,
    borderRadius: 8,
  },
  empty: {
    textAlign: "center",
    color: "#777",
    padding: 30,
  },
  modal: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    padding: 22,
    paddingTop: 55,
  },
  modalTitle: {
    fontSize: 25,
    fontWeight: "900",
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: "#e5e5e5",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  selectedImage: {
    color: "green",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    fontWeight: "900",
  },
  cancelButton: {
    padding: 16,
    alignItems: "center",
  },
});