import {
  useCallback,
  useState,
} from "react";

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

import * as ImagePicker from "expo-image-picker";

import {
  useFocusEffect,
} from "expo-router";

import {
  getProducts,
  money,
  saveProducts,
} from "../../lib/store";

export default function InventoryScreen() {
  const [items, setItems] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [name, setName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [oldPrice, setOldPrice] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [color, setColor] =
    useState("");

  const [sizes, setSizes] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [image, setImage] =
    useState(null);

  const loadProducts =
    useCallback(async () => {
      try {
        const products =
          await getProducts();

        setItems(products);
      } catch (error) {
        console.log(
          "LOAD INVENTORY ERROR:",
          error
        );
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setOldPrice("");
    setStock("");
    setColor("");
    setSizes("");
    setDescription("");
    setImage(null);
    setEditingId(null);
  };

  const openAddProduct = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditProduct = (
    product
  ) => {
    setEditingId(product.id);

    setName(
      product.name || ""
    );

    setCategory(
      product.category || ""
    );

    setPrice(
      String(product.price || "")
    );

    setOldPrice(
      String(product.oldPrice || "")
    );

    setStock(
      String(product.stock || "")
    );

    setColor(
      product.color || ""
    );

    if (
      Array.isArray(product.sizes)
    ) {
      setSizes(
        product.sizes.join(", ")
      );
    } else if (product.size) {
      setSizes(
        String(product.size)
          .split("/")
          .map(
            (size) => size.trim()
          )
          .join(", ")
      );
    } else {
      setSizes("");
    }

    setDescription(
      product.description || ""
    );

    if (
      product.image &&
      typeof product.image ===
        "string"
    ) {
      setImage(product.image);
    } else if (
      product.imageUri &&
      typeof product.imageUri ===
        "string"
    ) {
      setImage(
        product.imageUri
      );
    } else {
      setImage(null);
    }

    setShowModal(true);
  };

  const chooseImage =
    async () => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            "Permission Needed",
            "Please allow photo access to choose a product image."
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            }
          );

        if (
          !result.canceled
        ) {
          setImage(
            result.assets[0].uri
          );
        }
      } catch (error) {
        console.log(
          "IMAGE PICKER ERROR:",
          error
        );

        Alert.alert(
          "Error",
          "Could not choose the image."
        );
      }
    };

  const saveProduct =
    async () => {
      if (!name.trim()) {
        Alert.alert(
          "Missing Information",
          "Please enter the product name."
        );

        return;
      }

      if (!price.trim()) {
        Alert.alert(
          "Missing Information",
          "Please enter the price."
        );

        return;
      }

      if (!stock.trim()) {
        Alert.alert(
          "Missing Information",
          "Please enter the stock."
        );

        return;
      }

      if (
        Number(price) < 0
      ) {
        Alert.alert(
          "Invalid Price",
          "Price cannot be negative."
        );

        return;
      }

      if (
        oldPrice.trim() &&
        Number(oldPrice) < 0
      ) {
        Alert.alert(
          "Invalid Old Price",
          "Old price cannot be negative."
        );

        return;
      }

      if (
        Number(stock) < 0
      ) {
        Alert.alert(
          "Invalid Stock",
          "Stock cannot be negative."
        );

        return;
      }

      const productSizes =
        sizes
          .split(",")
          .map(
            (size) =>
              size.trim()
          )
          .filter(Boolean);

      const productData = {
        name: name.trim(),

        category:
          category.trim() ||
          "Menswear",

        price: Number(price),

        oldPrice:
          oldPrice.trim()
            ? Number(oldPrice)
            : 0,

        stock: Number(stock),

        color:
          color.trim() || "—",

        sizes:
          productSizes.length > 0
            ? productSizes
            : ["S", "M", "L", "XL"],

        description:
          description.trim() ||
          "This is a quality men's wear product made for comfortable and everyday use.",

        image:
          image || null,
      };

      try {
        let updatedProducts;

        if (editingId) {
          updatedProducts =
            items.map(
              (product) =>
                product.id ===
                editingId
                  ? {
                      ...product,
                      ...productData,
                    }
                  : product
            );
        } else {
          const newProduct = {
            id: `mw-${Date.now()}`,
            ...productData,
          };

          updatedProducts = [
            ...items,
            newProduct,
          ];
        }

        await saveProducts(
          updatedProducts
        );

        setItems(
          updatedProducts
        );

        const wasEditing =
          editingId !== null;

        resetForm();

        setShowModal(false);

        Alert.alert(
          "Success",
          wasEditing
            ? "Product updated successfully."
            : "Product added successfully."
        );
      } catch (error) {
        console.log(
          "SAVE PRODUCT ERROR:",
          error
        );

        Alert.alert(
          "Error",
          "Could not save the product."
        );
      }
    };

  const deleteProduct = (
    product
  ) => {
    Alert.alert(
      "Delete Product",
      `Are you sure you want to delete ${product.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",

          onPress:
            async () => {
              try {
                const updatedProducts =
                  items.filter(
                    (item) =>
                      item.id !==
                      product.id
                  );

                await saveProducts(
                  updatedProducts
                );

                setItems(
                  updatedProducts
                );

                Alert.alert(
                  "Deleted",
                  "Product deleted successfully."
                );
              } catch (error) {
                console.log(
                  "DELETE PRODUCT ERROR:",
                  error
                );

                Alert.alert(
                  "Error",
                  "Could not delete the product."
                );
              }
            },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Inventory
          </Text>

          <Text style={styles.subtitle}>
            Manage your men's wear products
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={
            openAddProduct
          }
        >
          <Text
            style={styles.addButtonText}
          >
            + Add
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.list
        }
      >
        {items.length === 0 ? (
          <View
            style={styles.emptyBox}
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              No Products
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Add your first product
              to the inventory.
            </Text>
          </View>
        ) : (
          items.map(
            (product) => (
              <View
                key={product.id}
                style={
                  styles.productCard
                }
              >
                {/* IMAGE */}

  {product.image === "polo" ? (
      <Image
        source={require("../../assets/products/polo.jpg")}
        style={styles.productImage}
      />
    ) : product.image === "jeans" ? (
      <Image
        source={require("../../assets/products/jeans.jpg")}
        style={styles.productImage}
      />
    ) : product.image === "jacket" ? (
      <Image
        source={require("../../assets/products/jacket.jpg")}
        style={styles.productImage}
      />
    ) : product.image &&
      typeof product.image === "string" ? (
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
      />
    ) : (
      <View style={styles.noImage}>
        <Text style={styles.noImageText}>
          No Image
        </Text>
      </View>
    )}

                {/* INFO */}

                <View
                  style={
                    styles.productInfo
                  }
                >
                  <Text
                    style={
                      styles.category
                    }
                  >
                    {product.category ||
                      "Menswear"}
                  </Text>

                  <Text
                    style={
                      styles.productName
                    }
                  >
                    {product.name}
                  </Text>

                  <Text
                    style={
                      styles.price
                    }
                  >
                    {money(
                      product.price
                    )}
                  </Text>

                  <Text
                    style={
                      styles.stock
                    }
                  >
                    Stock:{" "}
                    {product.stock}
                  </Text>

                  <Text
                    style={
                      styles.color
                    }
                  >
                    Color:{" "}
                    {product.color ||
                      "—"}
                  </Text>

                  <View
                    style={
                      styles.actionRow
                    }
                  >
                    <Pressable
                      style={
                        styles.editButton
                      }
                      onPress={() =>
                        openEditProduct(
                          product
                        )
                      }
                    >
                      <Text
                        style={
                          styles.editText
                        }
                      >
                        Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        deleteProduct(
                          product
                        )
                      }
                    >
                      <Text
                        style={
                          styles.deleteText
                        }
                      >
                        Delete
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )
          )
        )}
      </ScrollView>

      {/* ADD / EDIT MODAL */}

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setShowModal(false)
        }
      >
        <View
          style={
            styles.modalBackground
          }
        >
          <View
            style={styles.modal}
          >
            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              <View
                style={
                  styles.modalHeader
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  {editingId
                    ? "Edit Product"
                    : "Add Product"}
                </Text>

                <Pressable
                  onPress={() => {
                    resetForm();
                    setShowModal(
                      false
                    );
                  }}
                >
                  <Text
                    style={
                      styles.closeText
                    }
                  >
                    ✕
                  </Text>
                </Pressable>
              </View>

              {/* IMAGE */}

              <Text
                style={
                  styles.inputLabel
                }
              >
                Product Image
              </Text>

              <Pressable
                style={
                  styles.imagePicker
                }
                onPress={
                  chooseImage
                }
              >
                {image ? (
                  <Image
                    source={{
                      uri: image,
                    }}
                    style={
                      styles.previewImage
                    }
                  />
                ) : (
                  <>
                    <Text
                      style={
                        styles.imageIcon
                      }
                    >
                      📷
                    </Text>

                    <Text
                      style={
                        styles.imagePickerText
                      }
                    >
                      Choose Product Image
                    </Text>
                  </>
                )}
              </Pressable>

              {/* NAME */}

              <Text
                style={
                  styles.inputLabel
                }
              >
                Product Name *
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Example: Classic Polo Shirt"
                value={name}
                onChangeText={
                  setName
                }
              />

              {/* CATEGORY */}

              <Text
                style={
                  styles.inputLabel
                }
              >
                Category
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Example: Shirts"
                value={category}
                onChangeText={
                  setCategory
                }
              />

              {/* PRICE */}

              <Text
                style={
                  styles.inputLabel
                }
              >
                Price *
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Example: 799"
                value={price}
                onChangeText={
                  setPrice
                }
                keyboardType="numeric"
              />

              {/* OLD PRICE */}

              <Text
                style={
                  styles.inputLabel
                }
              >
                Old Price
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Example: 999"
                value={oldPrice}
                onChangeText={
                  setOldPrice
                }
                keyboardType="numeric"
              />

              {/* STOCK */}

              <Text
                style={
                  styles.inputLabel
                }
              >
                Stock *
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Example: 20"
                value={stock}
                onChangeText={
                  setStock
                }
                keyboardType="numeric"
              />

              {/* COLOR */}

              <Text
                style={
                  styles.inputLabel
                }
              >
                Color
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Example: Black"
                value={color}
                onChangeText={
                  setColor
                }
              />

              {/* SIZES */}

              <Text
                style={
                  styles.inputLabel
                }
              >
                Sizes
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Example: S, M, L, XL"
                value={sizes}
                onChangeText={
                  setSizes
                }
              />

              {/* DESCRIPTION */}

              <Text
                style={
                  styles.inputLabel
                }
              >
                Product Description
              </Text>

              <TextInput
                style={[
                  styles.input,
                  styles.descriptionInput,
                ]}
                placeholder="Example: Comfortable cotton shirt for everyday wear."
                value={description}
                onChangeText={
                  setDescription
                }
                multiline
                textAlignVertical="top"
              />

              {/* SAVE */}

              <Pressable
                style={
                  styles.saveButton
                }
                onPress={
                  saveProduct
                }
              >
                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  {editingId
                    ? "Update Product"
                    : "Add Product"}
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.cancelButton
                }
                onPress={() => {
                  resetForm();
                  setShowModal(
                    false
                  );
                }}
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f7",
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
  },

  subtitle: {
    marginTop: 4,
    color: "#777",
    fontSize: 13,
  },

  addButton: {
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "800",
  },

  list: {
    padding: 20,
    paddingTop: 5,
    paddingBottom: 40,
  },

  productCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
  },

  productImage: {
    width: 110,
    height: 130,
    borderRadius: 15,
    backgroundColor: "#eee",
  },

  noImage: {
    width: 110,
    height: 130,
    borderRadius: 15,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    color: "#777",
    fontSize: 12,
  },

  productInfo: {
    flex: 1,
    marginLeft: 15,
  },

  category: {
    fontSize: 11,
    color: "#777",
    textTransform: "uppercase",
    fontWeight: "700",
  },

  productName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginTop: 4,
  },

  price: {
    fontSize: 17,
    fontWeight: "800",
    marginTop: 7,
  },

  stock: {
    fontSize: 13,
    color: "#16803c",
    marginTop: 4,
  },

  color: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  editButton: {
    backgroundColor: "#eef2f7",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9,
  },

  editText: {
    color: "#111",
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#ffe9e9",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9,
  },

  deleteText: {
    color: "#d11a2a",
    fontWeight: "700",
  },

  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
  },

  emptyText: {
    marginTop: 5,
    color: "#777",
  },

  modalBackground: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "92%",
    padding: 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
  },

  closeText: {
    fontSize: 22,
    color: "#555",
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 7,
    color: "#222",
  },

  input: {
    backgroundColor: "#f4f5f7",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111",
  },

  descriptionInput: {
    height: 100,
    paddingTop: 12,
  },

  imagePicker: {
    height: 180,
    backgroundColor: "#f4f5f7",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  imageIcon: {
    fontSize: 35,
    marginBottom: 8,
  },

  imagePickerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
  },

  saveButton: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 25,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  cancelButton: {
    backgroundColor: "#eef2f7",
    paddingVertical: 16,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  cancelButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "800",
  },
});