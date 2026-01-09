"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import {
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  resetPassword,
  subscribeToAuthState,
  isFirebaseConfigured,
} from "@/lib/firebase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
}

interface UseAuthReturn extends AuthState {
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isConfigured: true,
  });

  useEffect(() => {
    // Check if Firebase is configured
    const configured = isFirebaseConfigured();
    if (!configured) {
      setState({
        user: null,
        loading: false,
        error: "Firebase設定が見つかりません。環境変数を設定してください。",
        isConfigured: false,
      });
      return;
    }

    const unsubscribe = subscribeToAuthState((user) => {
      setState((prev) => ({
        ...prev,
        user,
        loading: false,
        isConfigured: true,
      }));
    });

    return () => unsubscribe();
  }, []);

  const handleSignUp = useCallback(
    async (email: string, password: string, displayName?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        await signUp(email, password, displayName);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "登録に失敗しました";
        setState((prev) => ({ ...prev, error: message, loading: false }));
        throw err;
      }
    },
    []
  );

  const handleSignIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signIn(email, password);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "ログインに失敗しました";
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw err;
    }
  }, []);

  const handleSignInWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signInWithGoogle();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Googleログインに失敗しました";
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw err;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await signOut();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "ログアウトに失敗しました";
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw err;
    }
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await resetPassword(email);
      setState((prev) => ({ ...prev, loading: false }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "パスワードリセットに失敗しました";
      setState((prev) => ({ ...prev, error: message, loading: false }));
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    clearError,
  };
}
