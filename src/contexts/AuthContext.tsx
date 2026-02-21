"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut, Auth } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth as firebaseAuth, getUserByEmail, getOrganization, getSubscription } from "@/lib/firebase";
import type { User, Organization, Subscription, UserRole } from "@/types";

// ==========================================
// Types
// ==========================================

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  organization: Organization | null;
  subscription: Subscription | null;
  orgId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
  canAccess: (feature: keyof Subscription["features"]) => boolean;
  isWithinLimit: (type: "inspections" | "users") => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// ==========================================
// Context
// ==========================================

const AuthContext = createContext<AuthContextType | null>(null);

// ==========================================
// Public routes that don't require auth
// ==========================================

const PUBLIC_ROUTES = ["/", "/login", "/verify", "/pricing", "/about", "/contact", "/blog"];
const PUBLIC_PREFIXES = ["/blog/"];
const AUTH_ROUTES = ["/login", "/verify"];
const ONBOARDING_ROUTE = "/onboarding";

// ==========================================
// Provider Component
// ==========================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    organization: null,
    subscription: null,
    orgId: null,
    isLoading: true,
    isAuthenticated: false,
    needsOnboarding: false,
  });

  // ==========================================
  // Load user data from Firestore
  // ==========================================

  const loadUserData = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const email = firebaseUser.email;
      if (!email) {
        setState((prev) => ({
          ...prev,
          firebaseUser,
          isLoading: false,
          needsOnboarding: true,
        }));
        return;
      }

      // Look up user by email
      const result = await getUserByEmail(email);

      if (!result) {
        // User exists in Firebase Auth but not in Firestore - needs onboarding
        setState((prev) => ({
          ...prev,
          firebaseUser,
          isLoading: false,
          isAuthenticated: true,
          needsOnboarding: true,
        }));
        return;
      }

      const { user, orgId } = result;

      // Load organization and subscription
      const [organization, subscription] = await Promise.all([
        getOrganization(orgId),
        getSubscription(orgId),
      ]);

      setState({
        firebaseUser,
        user,
        organization,
        subscription,
        orgId,
        isLoading: false,
        isAuthenticated: true,
        needsOnboarding: false,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      setState((prev) => ({
        ...prev,
        firebaseUser,
        isLoading: false,
        isAuthenticated: true,
        needsOnboarding: true,
      }));
    }
  }, []);

  // ==========================================
  // Auth state listener
  // ==========================================

  useEffect(() => {
    if (!firebaseAuth) {
      // Firebase not configured, set as not loading
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser);
      } else {
        setState({
          firebaseUser: null,
          user: null,
          organization: null,
          subscription: null,
          orgId: null,
          isLoading: false,
          isAuthenticated: false,
          needsOnboarding: false,
        });
      }
    });

    return () => unsubscribe();
  }, [loadUserData]);

  // ==========================================
  // Route protection
  // ==========================================

  useEffect(() => {
    if (state.isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isOnboardingRoute = pathname === ONBOARDING_ROUTE;

    if (!state.isAuthenticated && !isPublicRoute) {
      // Not authenticated and trying to access protected route
      router.push("/login");
      return;
    }

    if (state.isAuthenticated && isAuthRoute) {
      // Authenticated but on auth route - redirect based on onboarding status
      if (state.needsOnboarding) {
        router.push("/onboarding");
      } else if (state.user?.role === "owner" || state.user?.role === "admin") {
        router.push("/owner");
      } else {
        router.push("/inspector");
      }
      return;
    }

    if (state.isAuthenticated && state.needsOnboarding && !isOnboardingRoute && !isPublicRoute) {
      // Needs onboarding but not on onboarding route
      router.push("/onboarding");
      return;
    }

    if (state.isAuthenticated && !state.needsOnboarding && isOnboardingRoute) {
      // Completed onboarding but on onboarding route - redirect to dashboard
      if (state.user?.role === "owner" || state.user?.role === "admin") {
        router.push("/owner");
      } else {
        router.push("/inspector");
      }
      return;
    }
  }, [state.isLoading, state.isAuthenticated, state.needsOnboarding, state.user?.role, pathname, router]);

  // ==========================================
  // Actions
  // ==========================================

  const signOut = useCallback(async () => {
    try {
      if (firebaseAuth) {
        await firebaseSignOut(firebaseAuth);
      }
      setState({
        firebaseUser: null,
        user: null,
        organization: null,
        subscription: null,
        orgId: null,
        isLoading: false,
        isAuthenticated: false,
        needsOnboarding: false,
      });
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (state.firebaseUser) {
      await loadUserData(state.firebaseUser);
    }
  }, [state.firebaseUser, loadUserData]);

  const refreshOrganization = useCallback(async () => {
    if (state.orgId) {
      const [organization, subscription] = await Promise.all([
        getOrganization(state.orgId),
        getSubscription(state.orgId),
      ]);
      setState((prev) => ({ ...prev, organization, subscription }));
    }
  }, [state.orgId]);

  const canAccess = useCallback(
    (feature: keyof Subscription["features"]): boolean => {
      if (!state.subscription) return false;
      return state.subscription.features[feature];
    },
    [state.subscription]
  );

  const isWithinLimit = useCallback(
    (type: "inspections" | "users"): boolean => {
      if (!state.subscription) return false;
      if (type === "inspections") {
        return state.subscription.inspectionsUsed < state.subscription.inspectionsLimit;
      }
      return state.subscription.usersCount < state.subscription.usersLimit;
    },
    [state.subscription]
  );

  const hasRole = useCallback(
    (role: UserRole | UserRole[]): boolean => {
      if (!state.user) return false;
      if (Array.isArray(role)) {
        return role.includes(state.user.role);
      }
      return state.user.role === role;
    },
    [state.user]
  );

  // ==========================================
  // Context value
  // ==========================================

  const value: AuthContextType = {
    ...state,
    signOut,
    refreshUser,
    refreshOrganization,
    canAccess,
    isWithinLimit,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ==========================================
// Hook
// ==========================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ==========================================
// Higher-order component for role protection
// ==========================================

export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function ProtectedComponent(props: P) {
    const { isLoading, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !hasRole(allowedRoles)) {
        router.push("/");
      }
    }, [isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
        </div>
      );
    }

    if (!hasRole(allowedRoles)) {
      return null;
    }

    return <Component {...props} />;
  };
}
