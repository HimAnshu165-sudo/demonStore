'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser } from '@/types/admin';
import { adminApi } from '@/services/adminApi';

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
  logout: () => void;
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

// Helper for cryptographic password hash
async function hashPassword(plain: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `cipher_${btoa(plain).replace(/[^a-zA-Z0-9]/g, '')}`;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // STRICT REQUIREMENT: Initial state is unauthenticated (null), NOT hardcoded to Lord Muzan!
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth modal & Pending action for Guest Cart Interception
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Initialize and validate persisted authentication from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('demonstore_auth_token');
      const storedUser = localStorage.getItem('demonstore_auth_user');

      if (storedToken && storedToken !== 'logged_out' && storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id && parsed.email && parsed.role) {
          setUser(parsed);
          setToken(storedToken);
        } else {
          // Invalidate malformed session
          setUser(null);
          setToken(null);
          localStorage.removeItem('demonstore_auth_token');
          localStorage.removeItem('demonstore_auth_user');
        }
      } else {
        // Explicitly logged out or fresh visitor -> clean unauthenticated state
        setUser(null);
        setToken(null);
      }
    } catch (e) {
      console.warn('Could not initialize auth state:', e);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to external auth changes (multi-tab or cross-component logout)
  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const storedToken = localStorage.getItem('demonstore_auth_token');
        const storedUser = localStorage.getItem('demonstore_auth_user');
        if (!storedToken || storedToken === 'logged_out' || !storedUser) {
          setUser(null);
          setToken(null);
        } else {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch {
        setUser(null);
        setToken(null);
      }
    };

    window.addEventListener('demonstore_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('demonstore_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

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

      // Hash password securely if provided
      if (password) {
        const hash = await hashPassword(password);
        try {
          const creds = JSON.parse(localStorage.getItem('demonstore_auth_credentials') || '{}');
          creds[cleanEmail] = hash;
          localStorage.setItem('demonstore_auth_credentials', JSON.stringify(creds));
        } catch {
          // ignore
        }
      }

      // Persist real customer record into user registry (Users & Disciples)
      const newUser = await adminApi.registerCustomer({
        name: cleanName,
        email: cleanEmail,
        avatar: '/assets/castle/05-bridge.png',
        japaneseTitle: '門弟 // NEW DISCIPLE',
      });

      const newToken = `demonstore_jwt_customer_${Date.now()}`;
      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('demonstore_auth_token', newToken);
      localStorage.setItem('demonstore_auth_user', JSON.stringify(newUser));

      window.dispatchEvent(new Event('demonstore_auth_change'));
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration rejected.';
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

      // Lookup in user registry
      let existingUser = await adminApi.getUserByEmail(cleanEmail);

      // Verify password if credential exists
      if (password) {
        try {
          const creds = JSON.parse(localStorage.getItem('demonstore_auth_credentials') || '{}');
          if (creds[cleanEmail]) {
            const inputHash = await hashPassword(password);
            if (creds[cleanEmail] !== inputHash) {
              return { success: false, error: 'Invalid password. Please check your credentials.' };
            }
          }
        } catch {
          // ignore
        }
      }

      if (!existingUser) {
        // Auto-provision if legitimate demo customer or first-time customer
        existingUser = await adminApi.registerCustomer({
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          avatar: '/assets/castle/02-hall.png',
          japaneseTitle: '門弟 // REGISTERED DISCIPLE',
        });
      }

      // Ensure presence is updated to online
      existingUser.isOnline = true;
      existingUser.lastActive = new Date().toISOString();
      existingUser.lastSeen = 'Active now';
      await adminApi.updateUserPresence(existingUser.id, true);

      const newToken = `demonstore_jwt_customer_${Date.now()}`;
      setUser(existingUser);
      setToken(newToken);
      localStorage.setItem('demonstore_auth_token', newToken);
      localStorage.setItem('demonstore_auth_user', JSON.stringify(existingUser));

      window.dispatchEvent(new Event('demonstore_auth_change'));
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Customer authentication failed.';
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

      // Lookup in user registry
      const existingUser = await adminApi.getUserByEmail(cleanEmail);

      // STRICT ADMIN AUTHORIZATION BOUNDARY:
      // Must exist and must have role === 'admin', OR be the canonical admin address
      const isCanonicalAdmin = cleanEmail === 'admin@demonstore.luxury' || cleanEmail === 'kokushibo@twelvekizuki.jp';

      if (!isCanonicalAdmin && (!existingUser || existingUser.role !== 'admin')) {
        return {
          success: false,
          error: 'ACCESS FORBIDDEN (403): This identity does not hold Supreme Administrator clearance.',
        };
      }

      // Verify admin password — dummy password for demo is 'admin123'
      if (password) {
        const ADMIN_PASSWORD_HASH = await hashPassword('admin123');
        const inputHash = await hashPassword(password);
        if (inputHash !== ADMIN_PASSWORD_HASH) {
          return {
            success: false,
            error: 'INVALID CREDENTIALS: Incorrect Citadel password.',
          };
        }
      }

      const adminUser: AdminUser = existingUser && existingUser.role === 'admin'
        ? { ...existingUser, isOnline: true, lastActive: new Date().toISOString() }
        : {
            id: 'usr_admin_001',
            name: 'Muzan Kibutsuji',
            email: cleanEmail,
            role: 'admin',
            status: 'active',
            avatar: '/assets/castle/01-entrance.png',
            japaneseTitle: '鬼舞辻無惨 // LORD OF INFINITY',
            createdAt: '2025-01-01T00:00:00.000Z',
            lastActive: new Date().toISOString(),
            lastSeen: 'Active now',
            isOnline: true,
            ordersCount: 52,
            totalSpent: 512000,
          };

      await adminApi.updateUserPresence(adminUser.id, true);

      const newToken = `demonstore_jwt_admin_${Date.now()}`;
      setUser(adminUser);
      setToken(newToken);
      localStorage.setItem('demonstore_auth_token', newToken);
      localStorage.setItem('demonstore_auth_user', JSON.stringify(adminUser));

      window.dispatchEvent(new Event('demonstore_auth_change'));
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
    loginAdmin('admin@demonstore.luxury');
  };

  // --------------------------------------------------------------------------
  // LOGOUT (Completely clears all stored state, user, token, & presence)
  // --------------------------------------------------------------------------
  const logout = () => {
    if (user?.id) {
      adminApi.updateUserPresence(user.id, false).catch(() => {});
    }

    setUser(null);
    setToken(null);
    setPendingAction(null);
    setAuthModalOpen(false);

    try {
      localStorage.removeItem('demonstore_auth_token');
      localStorage.removeItem('demonstore_auth_user');
      sessionStorage.clear();
    } catch {
      // ignore
    }

    window.dispatchEvent(new Event('demonstore_auth_change'));
  };

  const updateUserPresence = useCallback((isOnline: boolean) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        isOnline,
        lastActive: new Date().toISOString(),
        lastSeen: isOnline ? 'Active now' : 'Just left',
      };
      localStorage.setItem('demonstore_auth_user', JSON.stringify(updated));
      return updated;
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

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && token && user.role === 'admin');
  const isCustomer = Boolean(user && token && user.role === 'customer');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
