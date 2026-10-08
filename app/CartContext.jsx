import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Add product to cart
  const addToCart = (product, size) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.id === product.id &&
          item.size === size
      );

      // If product with same size is already in cart
      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id &&
          item.size === size
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      // Add new product
      return [
        ...currentCart,
        {
          ...product,
          size: size,
          quantity: 1,
          cartId:
            product.id +
            "-" +
            size +
            "-" +
            Date.now(),
        },
      ];
    });
  };

  // Increase quantity
  const increaseQuantity = (cartId) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (cartId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove product
  const removeFromCart = (cartId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.cartId !== cartId
      )
    );
  };

  // Remove everything
  const clearCart = () => {
    setCart([]);
  };

  // Total price
  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * item.quantity,
    0
  );

  // Number of products
  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}