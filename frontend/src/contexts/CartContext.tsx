import React, { createContext, useContext, useState } from "react";

type Variation = {
  _id?: string;
  name: string;
  price: number;
};

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  counterNo: number;
  variations?: Variation[];
};

type CartItem = {
  product: Product;
  selectedVariation?: Variation;
  quantity: number;
  price?: number;
};

type CartContextType = {
  cart: { [key: string]: CartItem };
  addToCart: (product: Product, variation?: Variation) => void;
  removeFromCart: (productId: number, variationId?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<{ [key: string]: CartItem }>({});

  const addToCart = (product: Product, variation?: Variation) => {
    setCart((prev) => {
      const key = variation?._id ? `${product.id}-${variation._id}` : `${product.id}`;
      const existing = prev[key];
      return {
        ...prev,
        [key]: existing
          ? { ...existing, quantity: existing.quantity + 1 }
          : { product, selectedVariation: variation, quantity: 1, price: product.price },
      };
    });
  };

  const removeFromCart = (productId: number, variationId?: string) => {
    setCart((prev) => {
      const key = variationId ? `${productId}-${variationId}` : `${productId}`;
      if (!prev[key]) return prev;

      const updatedQuantity = prev[key].quantity - 1;
      if (updatedQuantity <= 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [key]: { ...prev[key], quantity: updatedQuantity } };
    });
  };

  const clearCart = () => {
    setCart({});
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
