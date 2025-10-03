import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  sendPasswordReset,
} from '../services/authService';

interface AuthState {
  user: any;
  session: any;
  loading: boolean;
  error?: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: undefined,
    session: undefined,
    loading: true,
    error: undefined,
  });

  const resetError = () => setState((prev) => ({ ...prev, error: undefined }));

  useEffect(() => {
    const loadSession = async () => {
      const sessionResult = await refreshSession();
      const session = sessionResult.data?.session;

      if (!sessionResult.error && session?.user) {
        setState({
          session,
          user: session.user,
          loading: false,
          error: undefined,
        });
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: sessionResult.error,
        }));
      }
    };

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profileResult = await getCurrentUser();
        setState({
          session,
          user: profileResult.data?.user ?? session.user,
          loading: false,
          error: profileResult.error,
        });
      } else {
        setState({ user: undefined, session: undefined, loading: false });
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const actions = {
      register: async (email: string, password: string, metadata?: Record<string, unknown>) => {
        resetError();
        const result = await registerUser({ email, password, metadata });
        if (result.error) {
          setState((prev) => ({ ...prev, error: result.error }));
        }
        return result;
      },
      login: async (email: string, password: string) => {
        resetError();
        const result = await loginUser({ email, password });
        if (result.error) {
          setState((prev) => ({ ...prev, error: result.error }));
        }
        return result;
      },
      logout: async () => {
        resetError();
        const result = await logoutUser();
        if (result.error) {
          setState((prev) => ({ ...prev, error: result.error }));
        }
        return result;
      },
      refresh: async () => {
        resetError();
        const result = await refreshSession();
        if (result.error) {
          setState((prev) => ({ ...prev, error: result.error }));
        }
        return result;
      },
      sendPasswordReset: async (email: string) => {
        resetError();
        const result = await sendPasswordReset(email);
        if (result.error) {
          setState((prev) => ({ ...prev, error: result.error }));
        }
        return result;
      },
    };

    return {
      ...state,
      ...actions,
      clearError: resetError,
    };
  }, [state]);

  return value;
}


