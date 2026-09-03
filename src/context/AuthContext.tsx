'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser, UserRole } from '@/types/admin';

export interface PendingAction {
  type: 'ADD_TO_CART' | 'WISHLIST';
  product?: any;
  selectedSize?: string;
  quantity?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  isLoading: boolean;
  loginCustomer: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  quickAdminLogin: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserPresence: (isOnline: boolean) => void;
  // Auth Modal & Pending Action State
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  pendingAction: PendingAction | null;
  openAuthModal: (mode?: 'login' | 'signup', action?: PendingAction) => void;
  closeAuthModal: () => void;
  setPendingAction: (action: PendingAction | null) => void;
  executePendingAction: (callback?: (action: PendingAction) => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(rawUser: any): AdminUser {
  if (!rawUser) return null as any;

  const rawRole = rawUser.role || 'user';
  const role: UserRole = rawRole === 'admin' ? 'admin' : 'customer';

  return {
    id: rawUser.id || rawUser._id || `usr_${Date.now()}`,
    name: rawUser.name || 'Disciple',
    email: rawUser.email || '',
    role,
    status: rawUser.status === 'disabled' ? 'suspended' : 'active',
    avatar: rawUser.avatar || (role === 'admin' ? '/assets/castle/01-entrance.png' : '/assets/castle/02-hall.png'),
    japaneseTitle: rawUser.japaneseTitle || (role === 'admin' ? '鬼舞辻無惨 // LORD OF INFINITY' : '門弟 // CITADEL DISCIPLE'),
    createdAt: rawUser.createdAt ? new Date(rawUser.createdAt).toISOString() : new Date().toISOString(),
    lastActive: rawUser.lastSeen ? new Date(rawUser.lastSeen).toISOString() : new Date().toISOString(),
    lastSeen: 'Active now',
    isOnline: true,
    ordersCount: typeof rawUser.ordersCount === 'number' ? rawUser.ordersCount : 0,
    totalSpent: typeof rawUser.totalSpent === 'number' ? rawUser.totalSpent : 0,
    shippingAddress: rawUser.shippingAddress || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Japan',
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth modal & Pending action for Guest Cart Interception
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Check current session from backend HTTP-only cookie on mount
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(normalizeUser(data.user));
          return;
        }
      }
      setUser(null);
    } catch (err) {
      console.error('Error verifying auth session:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Periodic heartbeat when user is authenticated (60s interval)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetch('/api/users/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }).catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // --------------------------------------------------------------------------
  // CUSTOMER REGISTRATION
  // --------------------------------------------------------------------------
  const registerCustomer = async (
    name: string,
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      if (!cleanEmail || !cleanName) {
        return { success: false, error: 'Name and email are required to enter the Citadel.' };
      }

      if (!password || password.length < 6) {
        return { success: false, error: 'Security cipher (password) must be at least 6 characters.' };
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Registration rejected.' };
      }

      setUser(normalizeUser(data.user));
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // CUSTOMER LOGIN
  // --------------------------------------------------------------------------
  const loginCustomer = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, error: 'Please enter your account email.' };
      }

      if (!password) {
        return { success: false, error: 'Password is required to authenticate.' };
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Invalid email or password.' };
      }

      setUser(normalizeUser(data.user));
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // ADMIN LOGIN (Strict Role Authorization)
  // --------------------------------------------------------------------------
  const loginAdmin = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, error: 'Administrator email required.' };
      }

      if (!password) {
        return { success: false, error: 'Cipher password required.' };
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Invalid administrator credentials.' };
      }

      const normalized = normalizeUser(data.user);

      if (normalized.role !== 'admin') {
        // Log out cookie if non-admin attempted admin login
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
        return {
          success: false,
          error: 'ACCESS FORBIDDEN (403): This account does not hold Administrator clearance.',
        };
      }

      setUser(normalized);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Admin authentication failed.';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  // Backwards-compatible generic login method
  const login = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'admin@demonstore.luxury' || cleanEmail.includes('admin') || cleanEmail.includes('muzan')) {
      return loginAdmin(email, password);
    }
    return loginCustomer(email, password);
  };

  const quickAdminLogin = () => {
    loginAdmin('admin@demonstore.luxury', 'admin123');
  };

  // --------------------------------------------------------------------------
  // LOGOUT (Calls backend POST /api/auth/logout to clear HTTP-only cookie)
  // --------------------------------------------------------------------------
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setUser(null);
      setPendingAction(null);
      setAuthModalOpen(false);
    }
  };

  const updateUserPresence = useCallback((isOnline: boolean) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isOnline,
        lastActive: new Date().toISOString(),
        lastSeen: isOnline ? 'Active now' : 'Just left',
      };
    });
  }, []);

  // Modal & pending action handlers
  const openAuthModal = (mode: 'login' | 'signup' = 'login', action?: PendingAction) => {
    setAuthModalMode(mode);
    if (action) {
      setPendingAction(action);
    }
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const executePendingAction = (callback?: (action: PendingAction) => void) => {
    if (pendingAction) {
      const action = { ...pendingAction };
      setPendingAction(null);
      if (callback) {
        callback(action);
      }
    }
  };

  const isAuthenticated = Boolean(user);
  const isAdmin = Boolean(user && user.role === 'admin');
  const isCustomer = Boolean(user && user.role === 'customer');

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user ? 'cookie_session_active' : null,
        isAuthenticated,
        isAdmin,
        isCustomer,
        isLoading,
        loginCustomer,
        registerCustomer,
        loginAdmin,
        login,
        quickAdminLogin,
        logout,
        refreshUser,
        updateUserPresence,
        authModalOpen,
        authModalMode,
        pendingAction,
        openAuthModal,
        closeAuthModal,
        setPendingAction,
        executePendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
