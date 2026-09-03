'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  totalWishlisted: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Load user-scoped or guest wishlist from localStorage
  useEffect(() => {
    try {
      const storageKey = user
        ? `demonstore_wishlist_${user.id}`
        : 'demonstore_guest_wishlist';
      const saved = localStorage.getItem(storageKey);
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch {
      setWishlist([]);
    }
  }, [user?.id]);

  // Persist wishlist to localStorage on change
  useEffect(() => {
    try {
      const storageKey = user
        ? `demonstore_wishlist_${user.id}`
        : 'demonstore_guest_wishlist';
      localStorage.setItem(storageKey, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist, user?.id]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const isWishlisted = (productId: string): boolean => {
    return wishlist.some((p) => p.id === productId);
  };

  const clearWishlist = () => setWishlist([]);

  const totalWishlisted = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        clearWishlist,
        totalWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
