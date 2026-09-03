'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedSize: string, quantity?: number, bypassAuthCheck?: boolean) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedSize: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  formattedSubtotal: string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load user-scoped cart or guest cart
  useEffect(() => {
    try {
      const storageKey = user ? `demonstore_cart_${user.id}` : 'demonstore_guest_cart';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        setCart([]);
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage', e);
    }
  }, [user?.id]);

  // Sync cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      const storageKey = user ? `demonstore_cart_${user.id}` : 'demonstore_guest_cart';
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart, user?.id]);

  const addToCart = (product: Product, selectedSize: string, quantity = 1, bypassAuthCheck = false) => {
    // GUEST INTERCEPTION: If guest tries to add to cart, open Login/Signup dialog with intended action
    if (!isAuthenticated && !bypassAuthCheck) {
      openAuthModal('login', {
        type: 'ADD_TO_CART',
        product,
        selectedSize,
        quantity,
      });
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      } else {
        return [...prev, { product, selectedSize, quantity }];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, selectedSize: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedSize === selectedSize))
    );
  };

  const updateQuantity = (productId: string, selectedSize: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const formattedSubtotal = `₹${subtotal.toLocaleString('en-IN')}`;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        formattedSubtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
