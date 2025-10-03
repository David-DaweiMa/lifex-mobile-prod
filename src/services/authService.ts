import { supabase } from './supabase';

export interface AuthResponse<T = unknown> {
  data?: T;
  error?: string;
}

export async function registerUser({
  email,
  password,
  metadata,
}: {
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
}): Promise<AuthResponse> {
  try {
    const emailRedirectTo = process.env.EXPO_PUBLIC_EMAIL_CONFIRM_REDIRECT;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function logoutUser(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { data: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function getCurrentSession(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function refreshSession(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

export async function sendPasswordReset(email: string): Promise<AuthResponse> {
  try {
    const redirectTo = process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      ...(redirectTo ? { redirectTo } : {}),
    });

    if (error) {
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    return { error: (err as Error).message };
  }
}


