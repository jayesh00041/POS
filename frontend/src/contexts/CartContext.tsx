import React, { createContext, useContext, useState } from "react";

type Variation = {
  name: string;
  price: number;
};

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  counterNo: number;
  variations: Variation[];
};

type CartItem = {
  product: Product;
  selectedVariation: Variation;
  quantity: number;
};

type CartContextType = {
  cart: { [key: number]: CartItem };
  addToCart: (product: Product, variation: Variation) => void;
  removeFromCart: (productId: number, variationName: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<{ [key: number]: CartItem }>({});

  const addToCart = (product: Product, variation: Variation) => {
    setCart((prev) => {
      const key = `${product.id}-${variation.name}`;
      const existing = prev[key];
      return {
        ...prev,
        [key]: existing
          ? { ...existing, quantity: existing.quantity + 1 }
          : { product, selectedVariation: variation, quantity: 1 },
      };
    });
  };

  const removeFromCart = (productId: number, variationName: string) => {
    setCart((prev) => {
      const key = `${productId}-${variationName}`;
      if (!prev[key]) return prev;

      const updatedQuantity = prev[key].quantity - 1;
      if (updatedQuantity <= 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [key]: { ...prev[key], quantity: updatedQuantity } };
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
